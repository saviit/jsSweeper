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
        context.fillStyle = colors[RandomInt(0, colors.length)];//'gray';
        context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = colors[this.number];
        if (!this.hasMine) {
            context.fillText(''+this.number, this.x + Math.floor(this.width/2), this.y + Math.floor(this.y/2));
        }
        else {
            context.fillRect(this.x, this.y, this.width, this.height);
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
        this.mineTriggered = false;
        this.numberOfMines = numMines;
    }

    // Create board cells
    populate() {
        for (let i = 0; i < worldsize.y; i++) {
            for (let j = 0; j < worldsize.x; j++) {
                let cnum = RandomInt(0, colors.length);
                this.cells[i][j] = new Cell(j, i, 1, 1, colors[cnum]);
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

    initBoard() {
        this.populate();

        // randomize mine placement
        let m = this.numberOfMines;
        while (m > 0) {
            let cell;
            do {
                cell = this.getRandomCell();
            } while (cell.hasMine);
            cell.hasMine = true;
            m--;
        }
        
        this.setCellProperties();
    }

    update() {
        //        
    }

    draw(context) {
        for (let i = 0; i < worldsize.y; i++) {
            for (let j = 0; j < worldsize.x; j++) {
                this.cells[i][j].draw(context);
            }
        }
    }

}


//-----------------------------------------------
// PUBLIC DECLARATIONS
//-----------------------------------------------
const colors = ['gray', 'navy', 'red', 'green', 'blue', 'yellow', 'magenta', 'cyan', 'red'];
var cellSize = 40; // pixels
var worldsize = {x: 0, y: 0}
var minesInPlay = 10; // default
var game;

var canvas; //= document.getElementById("game");
var context; //= canvas.getContext('2d');
var debugtxt;
var info;

window.onload = function() {

    minesInPlay = document.getElementById("minesInPlay").value;
    canvas = document.getElementById("game");
    // board = document.getElementById("board");
    context = canvas.getContext('2d');
    // bctx = board.getContext('2d');
    debugtxt = document.getElementById("debug");
    info = document.getElementById("info");
    info.textContent = "";

    context.fillStyle = 'gray';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    worldsize.x = canvas.width / cellSize;
    worldsize.y = canvas.height / cellSize;

    info.textContent += "Creating new game instance...";
    game = new Game(worldsize, false);
    game.initBoard();
    info.textContent += "done!\n";
    
    //add key listeners
    this.canvas.addEventListener("click", function(ev) {
        let x = ev.offsetX;
        let y = ev.offsetY;
        let c = game.cells[Math.floor(y / cellSize)][Math.floor(x / cellSize)];
        if (c instanceof Cell) {
            // TODO check for mines
            info.textContent += "Clicked on Cell #" + c.number + "\n";
        }
        update();
        ev.preventDefault();
    });
    this.canvas.addEventListener("mousemove", function(ev) {
        let x = ev.offsetX;
        let y = ev.offsetY;
        debugtxt.textContent = "Mouse X, Y: " + x + ", " + y;
    });
    
    update();
}

function draw() {   
    game.draw(context);
}

function update() {
    game.update()
    draw();
}
