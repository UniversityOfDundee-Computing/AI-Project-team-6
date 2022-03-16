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
fetch("map.cfg").then((d)=>{
    d.json().then((data)=>{
        importFrom2dArr(data);
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
    arr.forEach((row)=>{
        let x = 0;
        row.forEach((cell)=>{
            GRID_DATA[y][x] = {v:cell, c:(cell===-1?0:-1)}
            x++;
        })
        y++;
    })
    renderGrid();

    // TODO temp
console.log(breadthFirstSearch());
}

// fillSquareOnGrid(0,1, "rgba(0,0,128,0.8)");
function fillSquareOnGrid(x, y, colour) {

    CONTEXT.clearRect(x * (CANVAS.width / GRID_CELLS_X), y * (CANVAS.height / GRID_CELLS_Y),
    (CANVAS.width / GRID_CELLS_X), (CANVAS.height / GRID_CELLS_Y));
    CONTEXT.fillStyle = colour;
    CONTEXT.fillRect(x * (CANVAS.width / GRID_CELLS_X), y * (CANVAS.height / GRID_CELLS_Y),
(CANVAS.width / GRID_CELLS_X), (CANVAS.height / GRID_CELLS_Y));
}

function breadthFirstSearch()
{
    let startLocation = {
        x: 4,
        y: 4
    };
    let goalLocation = {
        x: 8,
        y: 7
    }

    fillSquareOnGrid(goalLocation.x, goalLocation.y, "rgba(0,255,0,0.8)");
    fillSquareOnGrid(startLocation.x, startLocation.y, "rgba(255,255,0,0.8)");

    // root node
    // TODO make a class
    let node = {
        state: startLocation,
        parent: null,
        action: null,
        pathCost: 0
    };

    // todo make goal test function
    if (node.state == goalLocation) {
        return node;
    }
    
    let frontier = [node];
    let explored = [];

    let i = 0;
    while(true) {

        if(frontier.length == 0)
            return null;

        node = frontier.shift();
        explored.push(node.state);
        // console.log(node.state);
        // console.log(explored);

        let actions = getNeighbourValues(node.state.x, node.state.y);

        console.log(node);
            explored.forEach(state => {
                if(state.x != startLocation.x || state.y != startLocation.y)
                    fillSquareOnGrid(state.x, state.y, "rgba(173,216,230,0.8)");
            });   

            frontier.forEach(node => {
                fillSquareOnGrid(node.state.x, node.state.y, "rgba(0,0,255,0.8)");
            });

        for(let i = 0; i<actions.length; i++)
        {
            let action = actions[i];
            
            let currentLocation = {
                x: action.x,
                y: action.y
            }

            child = {
                state: currentLocation,
                parent: node,
                // TODO: unsure about action
                action: action,
                pathCost: node.pathCost + action.v
            };

            // TODO rewrite
            let matchingInFrontier = frontier.some(e => {
                if (e.state.x === child.state.x && e.state.y == child.state.y) {
                  return true;
                }
              });

              let matchingInExplored = explored.some(e => {
                if (e.x === child.state.x && e.y == child.state.y) {
                  return true;
                }
              });

            
            if(!matchingInFrontier && !matchingInExplored) {
                // console.log(child.state.x + " " + child.state.y);
                if (child.state.x == goalLocation.x && child.state.y == goalLocation.y)
                    return child;
                
                frontier.push(child);
                // console.log('matching none');
            }
            else
            {
                // console.log('matching both');
            }
        }

        if(i++ > 500)
        return;
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
function algoTemplate(startX = 0 , startY = 0, points = [{x:0,y:0}]) {

}