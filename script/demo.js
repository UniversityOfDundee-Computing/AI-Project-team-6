let START_LOCATION = new Location(23, 7);
let TARGET_LOCATIONS = [new Location(45, 28)];


document.getElementById("goBtn").onclick = (_) => {
    findPath(START_LOCATION, TARGET_LOCATIONS, document.getElementById("method").value);

    isVisualisationOn = document.getElementById("isViz").checked;
    isVisualisationDelayOn = document.getElementById("isDelay").checked;
    visualisationDelayAmount = document.getElementById("delayAmount").value;
}

// Test Code
fetch("map.cfg").then((d) => {
    d.json().then((data) => {
        console.log('data');
        importFrom2dArr(data);
    });
})