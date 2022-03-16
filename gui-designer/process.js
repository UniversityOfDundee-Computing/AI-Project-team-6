// MinQueue used to help with the Astar method - https://github.com/luciopaiva/heapify
const {MinQueue} = Heapify;

const CANVAS = document.getElementById("main_canvas");
const CONTEXT = CANVAS.getContext("2d");
const GRID_CELLS_X = 64;
const GRID_CELLS_Y = 32;

let GRID_DATA = [];
for (let y = 0; y < GRID_CELLS_Y; y++) {
    GRID_DATA.push([]);
    for (let x = 0; x < GRID_CELLS_X; x++)
        GRID_DATA[y].push({v: 0, c: -1});
}
fetch("map.cfg").then((d) => {
    d.json().then((data) => {
        importFrom2dArr(data);
        algo3(23, 7, [{x: 15, y: 19}, {x: 26, y: 11}, {x: 20, y: 22}, {x: 26, y: 23}]);
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
            GRID_DATA[y][x] = {v: cell, c: (cell === -1 ? 0 : -1)}
            x++;
        })
        y++;
    })
    renderGrid();
}


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

/**
 * algorithm template
 * @param startX
 * @param startY
 * @param points
 */
function algo3(startX = 0, startY = 0, points = [{x: 0, y: 0}]) {
    GRID_DATA[startY][startX].c = 1;
    for (let pointsKey in points) {
        GRID_DATA[points[pointsKey].y][points[pointsKey].x].c = 2;
    }
    renderGrid();

    let routes = [];


    points.forEach((pointDST) => {
        const pointSRC = {x:startX, y:startY};
        if (pointSRC !== pointDST) {
            let path = aStar(pointSRC, pointDST);
            if (path !== null)
                routes.push(reconstructPath(path.cameFrom, path.current));
        }
    });

    points.forEach((pointSRC) => {
        points.forEach((pointDST) => {
            if (pointSRC !== pointDST) {
                let path = aStar(pointSRC, pointDST);
                if (path !== null)
                    routes.push(reconstructPath(path.cameFrom, path.current));
            }
        });
    });

    routes.forEach((rte) => {
        rte.forEach((step) => {
            GRID_DATA[step[1]][step[0]].c = 3;
        })
    })
    renderGrid();

}

function distance(pointSRC, pointDST) {
    return Math.sqrt((pointSRC.x - pointDST.x) * (pointSRC.x - pointDST.x) +
        (pointSRC.y - pointDST.y) * (pointSRC.y - pointDST.y));
}

function reconstructPath(cameFrom, current) {
    const total_path = [];
    total_path.push(current);
    let c = current;
    while (cameFrom.has(c)) {
        c = cameFrom.get(c);
        total_path.push(c);
    }
    return total_path;
}

function aStar(pointSRC, pointDST) {
    const openSet = new MinQueue(GRID_CELLS_Y * GRID_CELLS_X, [], [], Array, Float32Array);
    const openSetList = new Set();
    const startPnt = [pointSRC.x, pointSRC.y];
    openSetList.add(startPnt);
    openSet.push(startPnt, distance(pointSRC, pointDST));
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    for (let y = 0; y < GRID_CELLS_Y; y++) {
        for (let x = 0; x < GRID_CELLS_X; x++) {
            gScore[[x, y]] = Infinity;
            fScore[[x, y]] = Infinity;
        }
    }
    gScore[[pointSRC.x, pointSRC.y]] = 0;
    fScore[[pointSRC.x, pointSRC.y]] = distance(pointSRC, pointDST);

    while (openSet.length > 0) {
        const current = openSet.pop();
        openSetList.delete(current);
        if (current[0] === pointDST.x && current[1] === pointDST.y)
            return {cameFrom, current};

        getNeighbourValues(current[0], current[1]).forEach((nei) => {
            const tentative_gScore = gScore[current] + nei.v + 1;
            const neiPnt = [nei.x, nei.y];
            if (tentative_gScore < gScore[neiPnt]) {
                cameFrom.set(neiPnt, current);
                gScore[neiPnt] = tentative_gScore;
                fScore[neiPnt] = tentative_gScore + distance(nei, pointDST);
                if (!openSetList.has(neiPnt)) {
                    openSet.push(neiPnt, distance(nei, pointDST));
                    openSetList.add(neiPnt);
                }
            }
        });
    }
    return null;
}