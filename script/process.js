const CANVAS = document.getElementById("main_canvas");
const CONTEXT = CANVAS.getContext("2d");

const GRID_OUTLINE = "rgba(255,0,0,0.5)";
const SLEEP_TIME = 1;

let GRID_CELLS_X = 1;
let GRID_CELLS_Y = 1;
let GRID_DATA = [];
for (let y = 0; y < GRID_CELLS_Y; y++) {
    GRID_DATA.push([]);
    for (let x = 0; x < GRID_CELLS_X; x++)
        GRID_DATA[y].push({ v: 0, c: -1 });
}

// Test Code
fetch("map.cfg").then((d) => {
    d.json().then((data) => {
        findPath(data, new Location(23, 7), [
            new Location(9, 26),
            new Location(27, 25),
            new Location(35, 26),
            new Location(44, 25),
            new Location(21, 23),
            new Location(14, 22),
            new Location(13, 15)
        ], "approach3");
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
            let colour;

            // Legacy colour picking code and rendering code - mostly replaced with fillSquareOnGrid()
            switch (GRID_DATA[y][x].c) {
                case -1:
                    colour = "rgba(255,255,255,0)";
                    break;
                case 0:
                    colour = "rgba(255,0,0,0.8)";
                    break;
                case 1:
                    colour = "rgba(0,255,0,0.8)";
                    break;
                case 2:
                    colour = "rgba(0,0,255,0.8)";
                    break;
                case 3:
                    colour = "rgba(255,0,255,0.8)";
                    break;
                case 4:
                    colour = "rgba(0,255,255,0.8)";
                    break;
                case 5:
                    colour = "rgba(255,255,0,0.8)";
                    break;
            }

            fillSquareOnGrid(x, y, colour);
        }
    }
}

/**
 * Import the map data from a 2d array of floats
 * @param arr
 */
function importFrom2dArr(arr) {
    GRID_CELLS_Y = arr.length;
    GRID_DATA = [];

    if (GRID_CELLS_Y > 0)
        GRID_CELLS_X = arr[0].length;
    else
        return;

    let y = 0;
    // Add the real data
    arr.forEach((row) => {
        GRID_DATA.push([]);
        row.forEach((cell) => {
            GRID_DATA[y][x] = { v: cell, c: (cell === -1 ? 0 : -1) }
            x++;
        })
        y++;
    })
    renderGrid();
}

/**
 * Fill a square on the grid in a colour
 * @param x
 * @param y
 * @param colour
 */
function fillSquareOnGrid(x, y, colour) {
    const cellWidth = (CANVAS.width / GRID_CELLS_X);
    const cellHeight = (CANVAS.width / GRID_CELLS_X);

    CONTEXT.fillStyle = colour;
    CONTEXT.strokeStyle = GRID_OUTLINE;

    CONTEXT.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight); // Background
    CONTEXT.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight); // Outline

/**
 * Wrapper to use Location objects
 * @param location
 * @param colour
 */
function fillSquareOnGridFromLocation(location, colour) {
    fillSquareOnGrid(location.x, location.y, colour)
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
 * Wrapper using Location class
 * @param location
 * @returns {*[]}
 */
function getNeighbourValuesFromLocation(location) {
    return getNeighbourValues(location.x, location.y);
}

/**
 * Gets the data related to all neighbouring possible cells
 * @param x
 * @param y
 * @returns [{v:Cell Value/Weight, x: xCoord, y: yCoord, d: compass direction (NESW)}]
 */
function getNeighbourValues(x, y) {
    const rtn = [];
    const cellsToCheck = [-1, 0, 1];

    // iterate in both directions +1-1, allow you to test for all 8 cells surrounding
    for (const dirY in cellsToCheck) {
        for (const dirX in cellsToCheck) {
            if (cellsToCheck[dirX] !== 0 || cellsToCheck[dirY] !== 0) { // verify we are not testing the cell itself
                const dir = (cellsToCheck[dirY] > 0 ? "N" : (cellsToCheck[dirY] < 0 ? "S" : "") +
                cellsToCheck[dirX] > 0 ? "E" : (cellsToCheck[dirX] < 0 ? "W" : "")); // Determine the compass direction
                if (
                    x + cellsToCheck[dirX] >= 0 && x + cellsToCheck[dirX] < GRID_CELLS_X && // Range Checks
                    y + cellsToCheck[dirY] >= 0 && y + cellsToCheck[dirY] < GRID_CELLS_Y &&
                    GRID_DATA[y + cellsToCheck[dirY]][x + cellsToCheck[dirX]].v !== -1 // Removes obstructed cells
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

/**
 * Called to trigger any of the algorithms
 * @param map
 * @param startLocation
 * @param targets
 * @param method
 */
function findPath(map = [[-1]], startLocation = new Location(0, 0),
                  targets = Location[0], method = "approach3") {

    importFrom2dArr(map);

    switch (method) {
        case "approach1":
            break;
        case "approach3":
            algo3(startLocation.x, startLocation.y, targets);
            break;
        default:
            console.error("Unknown method: '" + method + "'");
    }
}