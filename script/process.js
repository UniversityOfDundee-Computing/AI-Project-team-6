// MinQueue used to help with the Astar method - https://github.com/luciopaiva/heapify
const { MinQueue } = Heapify;

const CANVAS = document.getElementById("main_canvas");
const CONTEXT = CANVAS.getContext("2d");
const GRID_CELLS_X = 64;
const GRID_CELLS_Y = 32;

let GRID_DATA = [];
for (let y = 0; y < GRID_CELLS_Y; y++) {
    GRID_DATA.push([]);
    for (let x = 0; x < GRID_CELLS_X; x++)
        GRID_DATA[y].push({ v: 0, c: -1 });
}


// Test Code
fetch("map.cfg").then((d) => {
    d.json().then((data) => {
        importFrom2dArr(data);
        // algo3(23, 7, [{x: 9, y: 26}, {x: 27, y: 25}, {x: 35, y: 26}, {x: 44, y: 25}, {x: 21, y: 23},
        //     {x: 14, y: 22}, {x: 13, y: 15}, {x: 9, y: 12}, {x: 28, y: 16}, {x: 30, y: 19}, {x: 34, y: 13},
        //     {x: 28, y: 11}, {x: 45, y: 11}, {x: 45, y: 21}]);
    })
})


/**
 * Render updates to the canvas grid
 */
function renderGrid() {
    CONTEXT.fillStyle = "white";
    CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

    CONTEXT.lineWidth = 2;
    for (let y = 0; y < GRID_CELLS_Y; y++) {
        for (let x = 0; x < GRID_CELLS_X; x++) {

            // for testing set a cell to the desired color
            switch (GRID_DATA[y][x].c) {
                case -1:
                    CONTEXT.fillStyle = "rgba(255,255,255,0)";
                    break;
                case 0:
                    CONTEXT.fillStyle = "rgba(255,0,0,0.8)";
                    break;
                case 1:
                    CONTEXT.fillStyle = "rgba(0,255,0,0.8)";
                    break;
                case 2:
                    CONTEXT.fillStyle = "rgba(0,0,255,0.8)";
                    break;
                case 3:
                    CONTEXT.fillStyle = "rgba(255,0,255,0.8)";
                    break;
                case 4:
                    CONTEXT.fillStyle = "rgba(0,255,255,0.8)";
                    break;
                case 5:
                    CONTEXT.fillStyle = "rgba(255,255,0,0.8)";
                    break;
            }

            CONTEXT.fillRect(x * (CANVAS.width / GRID_CELLS_X), y * (CANVAS.height / GRID_CELLS_Y),
                (CANVAS.width / GRID_CELLS_X), (CANVAS.height / GRID_CELLS_Y));

            CONTEXT.strokeStyle = "rgba(255,0,0,0.5)";

            CONTEXT.strokeRect(x * (CANVAS.width / GRID_CELLS_X), y * (CANVAS.height / GRID_CELLS_Y),
                (CANVAS.width / GRID_CELLS_X), (CANVAS.height / GRID_CELLS_Y));
        }
    }
}

function importFrom2dArr(arr) {
    let y = 0;
    arr.forEach((row) => {
        let x = 0;
        row.forEach((cell) => {
            GRID_DATA[y][x] = { v: cell, c: (cell === -1 ? 0 : -1) }
            x++;
        })
        y++;
    })
    renderGrid();
}

// TODO: probably need to rewrite this
let exploredColoredCells = [];
let frontierColoredCells = [];
let startLocationColoredCells = [];
let targetLocationColoredCells = [];
// Function to color in a specified cell
function fillCellOnGrid(x, y, colour) {

    if (checkIfArrayContainsState(startLocationColoredCells, new State(x,y)) || checkIfArrayContainsState(targetLocationColoredCells, new State(x,y)))
        return false;

    // Clear the cell of any previous colour
    CONTEXT.clearRect(x * (CANVAS.width / GRID_CELLS_X), y * (CANVAS.height / GRID_CELLS_Y),
        (CANVAS.width / GRID_CELLS_X), (CANVAS.height / GRID_CELLS_Y));

    // Set the fill colour
    if (colour == "light-blue") {
        CONTEXT.fillStyle = "rgba(173,216,230)";
        exploredColoredCells.push(new State(x, y));
    }
    else if (colour == "blue") {
        CONTEXT.fillStyle = "rgba(0,0,255)";
        frontierColoredCells.push(new State(x, y));
    }
    else if (colour == "red") {
        CONTEXT.fillStyle = "rgba(255,0,0)";
        startLocationColoredCells.push(new State(x, y));
    }
    else if (colour == "green") {
        CONTEXT.fillStyle = "rgba(0,255,0)";
        targetLocationColoredCells.push(new State(x, y));
    }
    else if (colour == "yellow")
        CONTEXT.fillStyle = "rgba(255,255,0)";
    else if (colour == "black")
        CONTEXT.fillStyle = "rgba(0,0,0,0.5)";


    // Fill the cell with the colour
    CONTEXT.fillRect(x * (CANVAS.width / GRID_CELLS_X), y * (CANVAS.height / GRID_CELLS_Y),
        (CANVAS.width / GRID_CELLS_X), (CANVAS.height / GRID_CELLS_Y));
}

// TODO: fix if we want it
function resetExploredFrontierColors() {
    // let mergedArrays = exploredColoredCells.concat(frontierColoredCells);

    // mergedArrays.forEach(cell => { 
    //     CONTEXT.clearRect(cell.x * (CANVAS.width / GRID_CELLS_X), cell.y * (CANVAS.height / GRID_CELLS_Y),
    //     (CANVAS.width / GRID_CELLS_X), (CANVAS.height / GRID_CELLS_Y));
    // });
}

// Line taken from https://stackoverflow.com/questions/3583724/how-do-i-add-a-delay-in-a-javascript-loop
// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))


/**
 * -----
 * Path Finding Algos
 * ----
 */


/**
 * Gets the data related to all neighbouring possible cells
 * @param x
 * @param y
 * @returns [{v:Cell Value/Weight, x: xCoord, y: yCoord, d: compass direction (NESW)}]
 */
function getNeighbourValues(x, y) {
    const rtn = [];
    const cellsToCheck = [-1, 0, 1];
    for (const dirY in cellsToCheck) {
        for (const dirX in cellsToCheck) {
            if (cellsToCheck[dirX] !== 0 || cellsToCheck[dirY] !== 0) {
                const dir = (cellsToCheck[dirY] > 0 ? "N" : (cellsToCheck[dirY] < 0 ? "S" : "") + cellsToCheck[dirX] > 0 ? "E" : (cellsToCheck[dirX] < 0 ? "W" : ""));
                if (
                    x + cellsToCheck[dirX] >= 0 && x + cellsToCheck[dirX] < GRID_CELLS_X &&
                    y + cellsToCheck[dirY] >= 0 && y + cellsToCheck[dirY] < GRID_CELLS_Y &&
                    GRID_DATA[y + cellsToCheck[dirY]][x + cellsToCheck[dirX]].v !== -1
                ) {
                    rtn.push({
                        v: GRID_DATA[y + cellsToCheck[dirY]][x + cellsToCheck[dirX]].v,
                        x: x + cellsToCheck[dirX],
                        y: y + cellsToCheck[dirY],
                        d: dir
                    })
                }
            }
        }
    }
    return rtn;
}

function checkIfArrayContainsNode(array, node) {
    let doesElementExist = array.some(e => {
        return (e.state.x === node.state.x && e.state.y === node.state.y);
    });

    return doesElementExist;
}

function checkIfArrayContainsState(array, state) {
    let doesElementExist = array.some(e => {
        return (e.x === state.x && e.y === state.y);
    });

    return doesElementExist;
}