const {runAnUninformedSearch} = require("./approach1");
const {algo3} = require("./approach3");
const Location = require("./classes").Location;

exports.GRID_CELLS_X = 1;
exports.GRID_CELLS_Y = 1;
exports.GRID_DATA = [];
for (let y = 0; y < exports.GRID_CELLS_Y; y++) {
    exports.GRID_DATA.push([]);
    for (let x = 0; x < exports.GRID_CELLS_X; x++)
        exports.GRID_DATA[y].push({v: 0, c: -1});
}

/**
 * Import the map data from a 2d array of floats
 * @param arr
 */
exports.importFrom2dArr = (arr)=>{
    exports.GRID_CELLS_Y = arr.length;
    exports.GRID_DATA = [];

    if (exports.GRID_CELLS_Y > 0)
        exports.GRID_CELLS_X = arr[0].length;
    else
        return;

    let y = 0;
    // Add the real data
    arr.forEach((row) => {
        exports.GRID_DATA.push([]);
        let x = 0;
        row.forEach((cell) => {
            exports.GRID_DATA[y][x] = {v: cell, c: (cell === -1 ? 0 : -1)}
            x++;
        })
        y++;
    })
}


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
exports.getNeighbourValuesFromLocation = (location) =>{
    return getNeighbourValues(location.x, location.y);
}

/**
 * Gets the data related to all neighbouring possible cells
 * @param x
 * @param y
 * @returns [{v:Cell Value/Weight, x: xCoord, y: yCoord, d: compass direction (NESW)}]
 */
exports.getNeighbourValues = (x, y) => {
    const rtn = [];
    const cellsToCheck = [-1, 0, 1];

    // iterate in both directions +1-1, allow you to test for all 8 cells surrounding
    for (const dirY in cellsToCheck) {
        for (const dirX in cellsToCheck) {
            if (cellsToCheck[dirX] !== 0 || cellsToCheck[dirY] !== 0) { // verify we are not testing the cell itself

                const dir = ((cellsToCheck[dirY] > 0 ? "N" : (cellsToCheck[dirY] < 0 ? "S" : "")) +
                    (cellsToCheck[dirX] > 0 ? "E" : (cellsToCheck[dirX] < 0 ? "W" : ""))); // Determine the compass direction

                if (
                    x + cellsToCheck[dirX] >= 0 && x + cellsToCheck[dirX] < exports.GRID_CELLS_X && // Range Checks
                    y + cellsToCheck[dirY] >= 0 && y + cellsToCheck[dirY] < exports.GRID_CELLS_Y &&
                    exports.GRID_DATA[y + cellsToCheck[dirY]][x + cellsToCheck[dirX]].v !== -1 // Removes obstructed cells
                ) {
                    rtn.push({
                        v: (exports.GRID_DATA[y + cellsToCheck[dirY]][x + cellsToCheck[dirX]].v) * dir.length,
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

exports.checkIfArrayContainsNode = (array, node) => {
    return array.some(e => {
        return (e.state.x === node.state.x && e.state.y === node.state.y);
    });
}

exports.checkIfArrayContainsState = (array, state) => {
    return array.some(e => {
        return (e.x === state.x && e.y === state.y);
    });
}

/**
 * Called to trigger any of the algorithms
 * @param startLocation
 * @param targets
 * @param method
 */
exports.findPath = (startLocation = new Location(0, 0),
                  targets = Location[0], method = "approach3") => {

    switch (method) {
        case "uninformed-breadth-first":
            return runAnUninformedSearch(exports, startLocation, targets, "breadth-first")
        case "uninformed-uniform-cost":
            return runAnUninformedSearch(exports, startLocation, targets, "uniform-cost")
        case "approach3":
            return algo3(exports, startLocation.x, startLocation.y, targets);
        default:
            console.error("Unknown method: '" + method + "'");
    }
}