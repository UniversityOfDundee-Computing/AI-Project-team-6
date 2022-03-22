let START_LOCATION = new Location(0, 0);
let TARGET_LOCATIONS = [];
let GRID_MODE = "SRT";


importFrom2dArr( // Import from a 2d json array
    JSON.parse( // Parse the decoded data into a json object
        atob( // Decode the base64
            LZString.decompress( // Decompress the data
                unescape( // unescape the escaped characters
                    getCookie() // get the data cookie
                )
            )
        )
    )
);


// Based on https://www.w3schools.com/js/js_cookies.asp
function getCookie() {
    let name = "AI_MAP=";
    let decodedCookie = (document.cookie);
    let ca = decodedCookie.split(';');
    for (let c of ca) {
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


document.getElementById("goBtn").onclick = (_) => {
    isVisualisationOn = document.getElementById("isViz").checked;
    isVisualisationDelayOn = document.getElementById("isDelay").checked;
    visualisationDelayAmount = document.getElementById("delayAmount").value;

    findPath(START_LOCATION, TARGET_LOCATIONS, document.getElementById("method").value);
}

document.getElementById("btn_markStart").onclick = (_) => {
    GRID_MODE = "SRT";
}

document.getElementById("btn_markTarget").onclick = (_) => {
    GRID_MODE = "TAR";
}
document.getElementById("btn_eraser").onclick = (_) => {
    GRID_MODE = "ERA";
}
document.getElementById("btn_clear").onclick = (_) => {
    for (const row of GRID_DATA) {
        for (const rowElement of row) {
            if (rowElement.c === 4)
                rowElement.c = -1;
        }
    }
    renderGrid();
}

CANVAS.onclick = addPoint;

CANVAS.onmousemove = (event) => {
    if (event.buttons === 1)
        addPoint(event);
}

/*// Test Code
fetch("map.cfg").then((d) => {
    d.json().then((data) => {
        console.log('data');
        importFrom2dArr(data);
    });
})*/


function addPoint(event) {
    const x = Math.round(event.offsetX / (CANVAS.offsetWidth) * GRID_CELLS_X);
    const y = Math.round(event.offsetY / (CANVAS.offsetHeight) * GRID_CELLS_Y);

    if (x >= 0 && x < GRID_CELLS_X && y >= 0 && y < GRID_CELLS_Y) {
        switch (GRID_MODE) {
            case "SRT":
                if (GRID_DATA[y][x].v !== -1) {
                    GRID_DATA[y][x].c = 2;
                    // todo
                    // GRID_DATA[START_LOCATION.y][START_LOCATION.x].c = -1;
                    START_LOCATION = new Location(x, y);
                }
                break;
            case "TAR":
                if (GRID_DATA[y][x].v !== -1) {
                    GRID_DATA[y][x].c = 3;
                    TARGET_LOCATIONS.push(new Location(x, y));
                }
                break;
            case "ERA":
                if (GRID_DATA[y][x].v !== -1) {
                    GRID_DATA[y][x].c = -1;
                    let elemToDelete = TARGET_LOCATIONS.filter(e => {
                        return (e.x === x && e.y === y)
                    })[0];
                    const index = TARGET_LOCATIONS.indexOf(elemToDelete);
                    if (index > -1) {
                        TARGET_LOCATIONS.splice(index, 1);
                    }
                }
                break;
        }
    }
    renderGrid();
}