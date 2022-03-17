// Consts
const CANVAS = document.getElementById("main_canvas");
const CONTEXT = CANVAS.getContext("2d");
const GRID_CELLS_X = 64;
const GRID_CELLS_Y = 32;

// Global States
let GRID_DATA = [];
let GRID_MODE = "OBS"; // OBS = obstruction, WEI = weight, SRT = start loc, TAR = target loc, TRR = rem target
let GRID_Current_Weight = 0;
let GRID_Image_Data = null;
let GRID_Targets = [];
let GRID_StartPos = {x: -1, y: -1};

// Initialise array
for (let y = 0; y < GRID_CELLS_Y; y++) {
    GRID_DATA.push([]);
    for (let x = 0; x < GRID_CELLS_X; x++)
        GRID_DATA[y].push(0);
}
renderGrid(); // Initial call


// Event Handlers
CANVAS.onclick = (event) => {
    const x = Math.round(event.offsetX / (CANVAS.offsetWidth) * GRID_CELLS_X);
    const y = Math.round(event.offsetY / (CANVAS.offsetHeight) * GRID_CELLS_Y);
    switch (GRID_MODE) {
        case "SRT":
            GRID_StartPos = {x: x, y: y};
            break;
        case "TAR":
            GRID_Targets.push({x: x, y: y});
            break;
        case "TRR":
            let index = GRID_Targets.findIndex((i) => {
                return i.x === x && i.y === y
            });
            if (index !== -1) {
                GRID_Targets.splice(index, 1);
            }
            break;
        case "OBS":
            GRID_DATA[y][x] = -1;
            break;
        case "WEI":
            GRID_DATA[y][x] = (GRID_MODE === "OBS" ? -1 : GRID_Current_Weight);
            break;
    }

    renderGrid();
}

document.getElementById("btn_clear").onclick = (_) => {
    GRID_DATA = []
    for (let y = 0; y < GRID_CELLS_Y; y++) {
        GRID_DATA.push([]);
        for (let x = 0; x < GRID_CELLS_X; x++)
            GRID_DATA[y].push(0);
    }

    renderGrid();
}

document.getElementById("btn_Obs").onclick = (_) => {
    GRID_MODE = "OBS";
}

document.getElementById("btn_start").onclick = (_) => {
    GRID_MODE = "SRT";
}
document.getElementById("btn_target").onclick = (_) => {
    GRID_MODE = "TAR";
}
document.getElementById("btn_rem_target").onclick = (_) => {
    GRID_MODE = "TRR";
}

document.getElementById("btn_CellW").onclick = (_) => {
    GRID_MODE = "WEI";
    GRID_Current_Weight = parseFloat(
        prompt("Please enter a float from 0 to 1 representing the weight of the cell.")
    );
}

document.getElementById("btn_export").onclick = (_) => {
    downloadFile(JSON.stringify(GRID_DATA), "map.cfg", "application/json");
}

document.getElementById("btn_import").onclick = (_) => {
    document.getElementById("imageUpload").click();
}

document.getElementById("imageUpload").onchange = (_) => {
    // Based on http://jsfiddle.net/z3JtC/4
    if (typeof window.FileReader !== 'function') {
        console.error("FileReader not supported here")
        return;
    }

    let fileReader = new FileReader();
    fileReader.onload = () => {
        GRID_Image_Data = new Image();
        GRID_Image_Data.onload = () => {
            renderGrid();
        };
        GRID_Image_Data.src = fileReader.result.toString();
    };

    fileReader.readAsDataURL(document.getElementById("imageUpload").files[0]);
}

document.getElementById("btn_import_map").onclick = (_) => {
    document.getElementById("CFGUpload").click();
}

document.getElementById("CFGUpload").onchange = (_) => {
    // Based on http://jsfiddle.net/z3JtC/4
    if (typeof window.FileReader !== 'function') {
        console.error("FileReader not supported here")
        return;
    }

    let fileReader = new FileReader();
    fileReader.onload = () => {
        GRID_DATA = JSON.parse(fileReader.result.toString());
        renderGrid();
    };

    fileReader.readAsText(document.getElementById("CFGUpload").files[0]);
}


// Methods

/**
 * Render updates to the canvas grid
 */
function renderGrid() {
    CONTEXT.fillStyle = "white";
    CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

    if (GRID_Image_Data !== null)
        CONTEXT.drawImage(GRID_Image_Data,
            0, 0,
            GRID_Image_Data.width, GRID_Image_Data.height,
            0, 0,
            CANVAS.width, CANVAS.height);

    CONTEXT.lineWidth = 2;
    for (let y = 0; y < GRID_CELLS_Y; y++) {
        for (let x = 0; x < GRID_CELLS_X; x++) {

            // RED = Obstruction, Magenta = Weight
            if (GRID_DATA[y][x] === -1)
                CONTEXT.fillStyle = "rgba(255,0,0,0.8)";
            else
                CONTEXT.fillStyle = "rgba(255,0,255," + (GRID_DATA[y][x]) * 0.8 + ")";

            CONTEXT.fillRect(x * (CANVAS.width / GRID_CELLS_X), y * (CANVAS.height / GRID_CELLS_Y),
                (CANVAS.width / GRID_CELLS_X), (CANVAS.height / GRID_CELLS_Y));

            if (GRID_StartPos.x === x && GRID_StartPos.y === y)
                // CONTEXT.strokeStyle = "rgba(0,255,0,0.5)";
                CONTEXT.strokeStyle = "rgba(0,0,0,0.5)";
            else if (GRID_Targets.findIndex((i) => {
                return i.x === x && i.y === y
            }) !== -1)
                // CONTEXT.strokeStyle = "rgba(0,0,255,1)";
                CONTEXT.strokeStyle = "rgba(0,0,0,0.5)";
            else
                // CONTEXT.strokeStyle = "rgba(255,0,0,0.5)";
                CONTEXT.strokeStyle = "rgba(0,0,0,0.5)";

            CONTEXT.strokeRect(x * (CANVAS.width / GRID_CELLS_X), y * (CANVAS.height / GRID_CELLS_Y),
                (CANVAS.width / GRID_CELLS_X), (CANVAS.height / GRID_CELLS_Y));
        }
    }
    generateOutput();
}

/**
 * Generate the CLI outputs
 */
function generateOutput() {
    let GRID_TargetsCLI = "";
    let GRID_TargetsList = "";
    GRID_Targets.forEach((el) => {
        GRID_TargetsList += `<li>${el.x};${el.y}</li>`
    });

    GRID_TargetsCLI = GRID_TargetsList.replaceAll("</li><li>", ",")
        .replaceAll("<li>", "").replaceAll("</li>", "");

    document.getElementById("output").innerHTML =
        `<p>Start Location: ${GRID_StartPos.x};${GRID_StartPos.y}</p>` +
        "Points to visit:" +
        "<ul>" +
        GRID_TargetsList +
        "</ul>" +
        `<code>python ./main.py map.cfg ${GRID_StartPos.x};${GRID_StartPos.y} ${GRID_TargetsCLI}</code>`;
}

// Function to download data to a file - https://stackoverflow.com/a/30832210
function downloadFile(data, filename, type) {
    const file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        const a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

// function openSlideMenu() {
//     document.getElementById('side-menu').style.left = '0px';
//     document.getElementById('main').style.marginLeft = '250px';
// }

// function closeSlideMenu() {
//     document.getElementById('side-menu').style.left = '-250px';
//     document.getElementById('main').style.marginLeft = '0px';
// }