async function breadthFirstSearch(problem) {

    // Root node with initial state
    let rootNode = new Node({
        state: problem.initialState,
        parent: null,
        action: null,
        pathCost: 0
    });

    // Check if the root node is the solution
    if (problem.goalTest(rootNode.state)) {
        return rootNode;
    }

    // Create the frontier and explored data structures
    let frontier = [rootNode];
    let explored = [];

    // TODO: safeguard for infinite loops, delete
    let i = 0;

    while (true) {

        // Return failure if there are no more nodes to expand in the frontier
        if (frontier.length === 0)
            return null;

        // Get the next node to expand (first-in-first-out from frontier)
        let parentNode = frontier.shift();

        // Add the node to the explored set
        explored.push(parentNode.state);

        // Fill the current cell to visualise which cell is being expanded
        if (isVisualisationOn)
            fillSquareOnGridFromLocation(parentNode.state, "black");

        // Get the possible actions from the current node
        let actions = problem.getActions(parentNode.state);

        // Iterate through all actions
        for (let i = 0; i < actions.length; i++) {

            let action = actions[i];
            // The new state is the new x,y location
            let newState = new State(action.x, action.y);

            // Create the child node
            const childNode = new Node({
                state: newState,
                parent: parentNode,
                action: action,
                pathCost: parentNode.pathCost + action.v
            });

            // Check if the node is present in the frontier or explored set
            let isNodeInFrontier = checkIfArrayContainsNode(frontier, childNode);
            let isNodeInExploredSet = checkIfArrayContainsState(explored, childNode.state);

            // If not present in either
            if (!isNodeInFrontier && !isNodeInExploredSet) {

                // Return the node if it's the solution
                if (problem.goalTest(childNode.state))
                    return childNode;

                // Add the node to the frontier to be expanded in the next step
                frontier.push(childNode);
                // Fill the cell with colour to visualise the frontier set
                if (isVisualisationOn)
                    fillSquareOnGridFromLocation(childNode.state, "blue");
            }

            // Add a delay to visualise the algorithm
            if (isVisualisationDelayOn)
                await timer(visualisationDelayAmount);
        }

        // Fill the cell with colour to visualise the explored set
        if (isVisualisationOn)
            fillSquareOnGridFromLocation(parentNode.state, "aqua");

        if (i++ > 500)
            return;
    }
}

async function approach1(startLocation, targetLocations) {

    // TODO: get these as arguments
    // let startLocation = new State(4, 4);
    // let targetLocations = [
    //     new State(8, 7),
    //     new State(12, 7),
    // ];

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

        let foundTarget = await breadthFirstSearch(currentProblem);
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
