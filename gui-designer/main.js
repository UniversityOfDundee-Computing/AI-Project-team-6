const CANVAS = document.getElementById("main_canvas");
const CONTEXT = CANVAS.getContext("2d");

const GRID_CELLS_X = 64;
const GRID_CELLS_Y = 32;
let GRID_DATA = [];

// Initialise array
for (let y = 0; y < GRID_CELLS_Y; y++) {
    GRID_DATA.push([]);
    for (let x = 0; x < GRID_CELLS_X; x++)
        GRID_DATA[y].push(0);
}



renderGrid();

CANVAS.onclick = (event) =>{
    const x = event.offsetX;
    const y = event.offsetY;

    GRID_DATA[Math.round(y/(CANVAS.offsetHeight)*GRID_CELLS_Y)][Math.round(x/(CANVAS.offsetWidth)*GRID_CELLS_X)] = -1;

    renderGrid();
}



function renderGrid() {
    CONTEXT.strokeStyle = "rgba(255,0,0,0.5)";
    CONTEXT.lineWidth = 2;
    for (let y = 0; y < GRID_CELLS_Y; y++) {
        for (let x = 0; x < GRID_CELLS_X; x++) {

            // RED = Obstruction, Magenta = Weight
            if (GRID_DATA[y][x] === -1)
                CONTEXT.fillStyle = "rgba(255,0,0,0.8)";
            else
                CONTEXT.fillStyle = "rgba(255,0,255," + (GRID_DATA[y][x])*0.8 + ")";

            CONTEXT.fillRect(x*(CANVAS.width/GRID_CELLS_X),y*(CANVAS.height/GRID_CELLS_Y),(CANVAS.width/GRID_CELLS_X),(CANVAS.height/GRID_CELLS_Y));

            CONTEXT.strokeRect(x*(CANVAS.width/GRID_CELLS_X),y*(CANVAS.height/GRID_CELLS_Y),(CANVAS.width/GRID_CELLS_X),(CANVAS.height/GRID_CELLS_Y));
        }
    }
}