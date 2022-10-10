"use strict";

Array.matrix = function(numrows, numcols, initial) {
    var arr = [];
    for (var i = 0; i < numrows; ++i) {
        var columns = [];
        for (var j = 0; j < numcols; ++j) {
            columns[j] = initial;
        }
        arr[i] = columns;
    }
    return arr;
}

function RandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distance(other) {
        if (other instanceof Point) {
            a = Math.abs(this.x - other.x);
            b = Math.abs(this.y - other.y);
            return Math.sqrt((a*a + b*b));
        }
    }
}

class CellButton {
    constructor(x, y, w, h, color) {
        this.x = x * cellSize;
        this.y = y * cellSize;
        this.width = w * cellSize;
        this.height = h * cellSize;
        this.color = color;
        this.pressed = false;
        this.opened = false;
        this.flagged = false;

        // draw coordinate shortcuts (calculate once)
        this.outerNW = new Point(this.x, this.y);
        this.outerNE = new Point(this.x + this.width, this.y);
        this.outerSW = new Point(this.x, this.y + this.height);
        this.outerSE = new Point(this.x + this.width, this.y + this.height);
        this.innerNW = new Point(this.x + Math.floor(this.width * 0.2), this.y + Math.floor(this.height * 0.2));
        this.innerNE = new Point(this.x + Math.floor(this.width * 0.8), this.y + Math.floor(this.height * 0.2));
        this.innerSW = new Point(this.x + Math.floor(this.width * 0.2), this.y + Math.floor(this.height * 0.8));
        this.innerSE = new Point(this.x + Math.floor(this.width * 0.8), this.y + Math.floor(this.height * 0.8));
    }

    draw(context) {
        if (!this.opened) {
            if (this.pressed) {
                if (this.flagged) { this.drawFlaggedInverse(context); }
                else this.drawInverse(context);
            }
            else { 
                if (this.flagged) { this.drawFlagged(context); } 
                else this.drawNormal(context); 
            }
        }
        else {
            // draw transparent
            this.drawOpened(context);

        }
        
    }

    drawMiddle(context) {
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    drawTopLeft(context) {
        context.beginPath();
        context.moveTo(this.outerNW.x, this.outerNW.y);
        context.lineTo(this.outerNE.x, this.outerNE.y);
        context.lineTo(this.innerNE.x, this.innerNE.y);
        context.lineTo(this.innerNW.x, this.innerNW.y);
        context.lineTo(this.innerSW.x, this.innerSW.y);
        context.lineTo(this.outerSW.x, this.outerSW.y);
        context.closePath();
        context.fill();
    }

    drawBottomRight(context) {
        context.beginPath();
        context.moveTo(this.outerSE.x, this.outerSE.y);
        context.lineTo(this.outerNE.x, this.outerNE.y);
        context.lineTo(this.innerNE.x, this.innerNE.y);
        context.lineTo(this.innerSE.x, this.innerSE.y);
        context.lineTo(this.innerSW.x, this.innerSW.y);
        context.lineTo(this.outerSW.x, this.outerSW.y);
        context.closePath();
        context.fill();
    }

    drawNormal(context) {
        // 'middle area' of button
        context.fillStyle = 'rgba(211, 211, 211, 1)';
        this.drawMiddle(context);
        // left and top slopes of button
        context.fillStyle = 'gainsboro';
        this.drawTopLeft(context);
        // right and bottom slopes of button
        context.fillStyle = 'gray';
        this.drawBottomRight(context);
    }

    drawInverse(context) {
        // 'middle area' of button
        context.fillStyle = 'darkgray';
        this.drawMiddle(context);
        // left and top slopes of button
        context.fillStyle = 'gray';
        this.drawTopLeft(context);
        // right and bottom slopes of button
        context.fillStyle = 'lightgray';
        this.drawBottomRight(context);
    }

    drawFlag(context, color) {
        // draw flag
        context.fillStyle = color;
        context.fillRect(this.x + Math.floor(this.width * 0.4),
                         this.y + Math.floor(this.height * 0.4),
                         4, Math.floor(this.height * 0.4));
        context.beginPath();
        context.moveTo(this.x + Math.floor(this.width * 0.4) + 4, 
                       this.y + Math.floor(this.height * 0.4));
        context.lineTo(this.x + Math.floor(this.width * 0.6), this.y + Math.floor(this.height * 0.3));
        context.lineTo(this.x + Math.floor(this.width * 0.4) + 4, this.y + Math.floor(this.height * 0.5));
        context.closePath();
        context.fill();
    }

    drawFlagged(context) {
        this.drawNormal(context);
        this.drawFlag(context, 'red');
    }

    drawFlaggedInverse(context) {
        this.drawInverse(context);
        this.drawFlag(context, 'darkred');
    }

    drawOpened(context) {
        // context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.clearRect(this.x, this.y, this.width, this.height);
    }

    toggleFlagged() {
        this.flagged = !this.flagged;
    }

}


class Cell {
    constructor(x, y, w, h, color) {
        this.x = x * cellSize;
        this.y = y * cellSize;
        this.width = w * cellSize;
        this.height = h * cellSize;
        this.color = color;
        
        this.flagged = false;
        this.number = 0; // 0 = empty; 1-8 = num of neighboring mines; 9 = mine
        this.hasMine = false;
    }

    draw(context) {
        context.fillStyle = 'black';
        context.fillRect(this.x, this.y, this.width, this.height);
        // context.fillStyle = colors[RandomInt(0, colors.length)];//'gray';
        context.fillStyle = 'lightgray';
        context.fillRect(this.x+1, this.y+1, this.width-2, this.height-2);
        context.fillStyle = colors[this.number];
        if (!this.hasMine) {
            if (this.number > 0) {
                context.font = fontSize + ' Agency FB';
                let cellText = ''+this.number;
                let tmCellText = context.measureText(cellText);
                let cellTextW = Math.floor(tmCellText.width);
                let cellTextH = Math.floor((tmCellText.actualBoundingBoxAscent + tmCellText.actualBoundingBoxDescent));
                let textPosX = Math.floor(this.x + (cellSize / 2) - (cellTextW / 2));
                let textPosY = Math.floor(this.y + (this.height / 2) + (cellTextH / 2));
                // info.textContent += "Cell X, Y: " + this.x + "," + this.y + " textPosX: " + textPosX + "\n";
                context.fillText(cellText, textPosX, textPosY);
            }
        }
        else {
            context.fillStyle = 'red';
            context.fillRect(this.x+1, this.y+1, this.width-2, this.height-2);
        }
    }

    toggleFlagged() {
        this.flagged = !this.flagged;
    }

    hasMine() { return this.hasMine };

    checkNeighbours(game) {
        if (this.hasMine) {
            this.number = 9;
            this.color = colors[this.number];
            return; 
        }
        let x = Math.floor(this.x / cellSize);
        let y = Math.floor(this.y / cellSize);
        let mines = 0;

        let ny = (y - 1);
        let sy = (y + 1);
        let wx = (x - 1);
        let ex = (x + 1);

        if (ny >= 0) {
            if (wx >= 0 && game.cells[ny][wx].hasMine) mines++;
            if (game.cells[ny][x].hasMine) mines++;
            if (ex < worldsize.x && game.cells[ny][ex].hasMine) mines++;
        }
        if (sy < worldsize.y) {
            if (wx >= 0 && game.cells[sy][wx].hasMine) mines++;
            if (game.cells[sy][x].hasMine) mines++;
            if (ex < worldsize.x && game.cells[sy][ex].hasMine) mines++;
        }
        if (wx >= 0 && game.cells[y][wx].hasMine) mines++;
        if (ex < worldsize.x && game.cells[y][ex].hasMine) mines++;

        
        this.number = mines;
        // this.color = colors[this.number];
    }
}


class Game {
    constructor(worldsize, numMines) {
        this.cells = Array.matrix(worldsize.y, worldsize.x, undefined);
        this.cellbtns = Array.matrix(worldsize.y, worldsize.x, undefined);
        this.mineTriggered = false;
        this.numberOfMines = numMines;
    }

    // Create board cells
    populate() {
        for (let i = 0; i < worldsize.y; i++) {
            for (let j = 0; j < worldsize.x; j++) {
                this.cells[i][j] = new Cell(j, i, 1, 1, 'lightgray');
                this.cellbtns[i][j] = new CellButton(j, i, 1, 1, 'lightgray');
            }
        }
    }

    setCellProperties() {
        for (let i = 0; i < worldsize.y; i++) {
            for (let j = 0; j < worldsize.x; j++) {
                this.cells[i][j].checkNeighbours(this);
            }
        }
    }

    getRandomCell() {
        let randX = RandomInt(0, worldsize.x);
        let randY = RandomInt(0, worldsize.y);
        return this.cells[randY][randX];
    }

    getCellAt(x, y) {
        return this.cells[Math.floor(y / cellSize)][Math.floor(x / cellSize)];
    }

    getCellBtnAt(x, y) {
        return this.cellbtns[Math.floor(y / cellSize)][Math.floor(x / cellSize)];
    }

    initBoard() {
        this.populate();

        // randomize mine placement
        let m = this.numberOfMines;
        for (let i = m; i > 0; i--) {
            let cell = this.getRandomCell();
            if (cell.hasMine) i++;
            else cell.hasMine = true;
        }
        
        this.setCellProperties();

    }

    update() {
        //        
    }

    drawBoard(context) {
        for (let i = 0; i < worldsize.y; i++) {
            for (let j = 0; j < worldsize.x; j++) {
                this.cells[i][j].draw(context);
            }
        }
    }

    drawGame(context) {
        for (let i = 0; i < worldsize.y; i++) {
            for (let j = 0; j < worldsize.x; j++) {
                this.cellbtns[i][j].draw(context);
            }
        }
    }

    draw() {
        this.drawBoard(boardCtx);
        this.drawGame(gameCtx);
    }

    openCellBtn(btn) {
        this.getCellBtnAt(btn.x, btn.y).opened = true;
    }

}


//-----------------------------------------------
// PUBLIC DECLARATIONS
//-----------------------------------------------
const colors = ['gray', 'navy', 'red', 'green', 'blue', 'yellow', 'magenta', 'cyan', 'red'];
var cellSize = 40; // pixels
var fontSize = ''+Math.floor(cellSize/2)+'px';
var worldsize = {x: 0, y: 0} // board: 800x600 = 20x15 cells = 300 cells
var minesCtrl;
var defaultMines = 30; // easyish, cf. traditional 10 mines per 81 cells
var game;
var board;

var boardCanvas; //= document.getElementById("board");
var boardCtx; //= canvas.getContext('2d');
var gameCanvas;
var gameCtx;
var debugtxt;
var info;
var cellLastPressed;
var cellButtonLastPressed;

window.onload = function() {

    boardCanvas = document.getElementById("board");
    gameCanvas = document.getElementById("game");
    boardCtx = boardCanvas.getContext('2d');
    gameCtx = gameCanvas.getContext('2d');
    debugtxt = document.getElementById("debug");
    minesCtrl = document.getElementById("mineCtrl");
    minesCtrl.value = defaultMines;
    info = document.getElementById("info");
    info.textContent = "";

    boardCtx.fillStyle = 'gray';
    boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
    
    worldsize.x = boardCanvas.width / cellSize;
    worldsize.y = boardCanvas.height / cellSize;

    info.textContent += "Creating new game instance...";
    let mines = parseInt(minesCtrl.value);
    game = initialize(worldsize, mines);
    info.textContent += "done!\n";
    
    //add key listeners
    this.gameCanvas.addEventListener("click", function(ev) {
        let x = ev.offsetX;
        let y = ev.offsetY;
        let c = game.getCellAt(x, y);
        let b = game.getCellBtnAt(x, y);
        let mbuttonpressed = ev.button;
        if (mbuttonpressed == 0) { // primary mouse button, usually left
            info.textContent += "MButton: 0\n";
            if (c instanceof Cell) {
                if (c.flagged) { } // was flagged so ignore
                // TODO check for mines
                if (c.hasMine && !c.flagged) {
                    info.textContent += "GAME OVER!\n";
                }
                info.textContent += "Cell #: " + c.number + "\n";
            }
            if (b instanceof CellButton) {
                if (!b.flagged) {
                    game.openCellBtn(b);
                    update();
                }
            }
        }
        if (mbuttonpressed == 2) { // secondary mouse button, usually right
            ev.preventDefault();
            info.textContent += "MButton: 2\n";
            c.toggleFlagged();
            b.toggleFlagged();
        }

        update();
        ev.preventDefault();
        // ev.stopImmediatePropagation();
    });
    // animate CellButton
    this.gameCanvas.addEventListener("mousedown", function(ev) {
        let x = ev.offsetX;
        let y = ev.offsetY;
        cellButtonLastPressed = game.getCellBtnAt(x, y);
        // cellButtonLastPressed.pressed = true;
        // update();
    });
    // animate CellButton, check for Bomb trigger
    this.gameCanvas.addEventListener("mouseup", function(ev) {
        let x = ev.offsetX;
        let y = ev.offsetY;
        let b = game.getCellBtnAt(x, y);
        //if (cellButtonLastPressed.x == b.x && cellButtonLastPressed.y == b.y) {
        //    cellButtonLastPressed.pressed = false;
        //} else b.pressed = false;
        //update();
    });
    this.gameCanvas.addEventListener("mousemove", function(ev) {
        let x = ev.offsetX;
        let y = ev.offsetY;
        debugtxt.textContent = "Mouse X, Y: " + x + ", " + y;
    });
    
    update();
}

function draw() {   
    game.draw();
}

function update() {
    
    game.update()
    draw();
}

function initialize(w, m) {
    game = new Game(w, m);
    game.initBoard();
    return game;
}
