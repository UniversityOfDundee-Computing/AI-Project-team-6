async function runApproach1(startLocation, targetLocations, algorithmToUse) {

    // Fill in the start and goal cells
    // TODO: fix
    fillSquareOnGridFromLocation(startLocation, "red");
    targetLocations.forEach(location => {
        fillSquareOnGridFromLocation(location, "green");
    });

    const startLocationCopy = startLocation;
    const targetLocationsCopy = targetLocations;

    // The initial search finds a path from the start location to the nearest target location
    // The next iteration finds a path from that nearest target location to the next nearest target location
    // Loop repeats until all targets are found
    do {

        // Paint origin and target cells
        GRID_DATA[startLocationCopy.y][startLocationCopy.x].c = 1;
        for (let pointsKey in targetLocationsCopy) {
            GRID_DATA[targetLocationsCopy[pointsKey].y][targetLocationsCopy[pointsKey].x].c = 3;
        }
        renderGrid();

        let currentProblem = new Problem({
            initialState: startLocation,
            goalStates: targetLocations
        });

        // Sort the targets by straight-line distance
        targetLocations.sort(function(a, b) {return distance(a, startLocation) - distance(b, startLocation)});

        // Execute a search from new start location to any of the remaining targets
        let foundTarget = null;
        if (algorithmToUse == "breadth-first")
            foundTarget = await breadthFirstSearch(currentProblem);
        else if (algorithmToUse == "uniform-cost")
            foundTarget = await uniformCostSearch(currentProblem);
        else if (algorithmToUse == "astar")
            foundTarget = await aStarSearch(currentProblem);

        // Set the found target to be the new start location for the next search iteration
        startLocation = foundTarget.state;

        // Remove the target that was last found from the list of targets
        targetLocations = targetLocations.filter(function (value) {
            return !(value.x == foundTarget.state.x && value.y == foundTarget.state.y);
        });

        // Reset the colored frontier and explored set from previous search
        resetExploredFrontierColors();

        // Paint the new cells
        foundTarget.parent

        drawPath(foundTarget);
        // Paint origin and target cells
        GRID_DATA[startLocationCopy.y][startLocationCopy.x].c = 1;
        for (let pointsKey in targetLocationsCopy) {
            GRID_DATA[targetLocationsCopy[pointsKey].y][targetLocationsCopy[pointsKey].x].c = 3;
        }
        renderGrid();

        // Repeat searches until no target locations are left
    } while (targetLocations.length > 0);
}

function drawPath(node) {
    if (node == null)
        return;
    GRID_DATA[node.state.y][node.state.x].c = 4;
    drawPath(node.parent);
}
