const CANVAS = document.getElementById("main_canvas");
const CONTEXT = CANVAS.getContext("2d");
const GRID_CELLS_X = 64;
const GRID_CELLS_Y = 32;

let GRID_DATA = [];
for (let y = 0; y < GRID_CELLS_Y; y++) {
    GRID_DATA.push([]);
    for (let x = 0; x < GRID_CELLS_X; x++)
        GRID_DATA[y].push({v:0,c:-1});
}
renderGrid();


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
    const cellsToCheck = [-1,0,1];
    for (const dirY in cellsToCheck) {
        for (const dirX in cellsToCheck) {
            if (cellsToCheck[dirX] !== 0 && cellsToCheck[dirY] !== 0) {
                if (
                    x+dirX >= 0 && x+dirX < GRID_CELLS_X &&
                    y+dirY >= 0 && y+dirY < GRID_CELLS_Y &&
                    GRID_DATA[y+dirY][x+dirX].v !== -1) {
                    rtn.push({
                        v:GRID_DATA[y+dirY][x+dirX].v,
                        x:x+dirX,
                        y:y+dirY,
                        d:(dirY>0?"N":(dirY<0?"S":"") + dirX>0?"E":(dirX<0?"W":""))
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
function algoTemplate(startX = 0 , startY = 0, points = [{x:0,y:0}]) {

}