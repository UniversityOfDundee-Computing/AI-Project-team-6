let isVisualisationDelayOn = true;
let visualisationDelayAmount = 30;

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
        fillCellOnGrid(parentNode.state.x, parentNode.state.y, "black");

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
                fillCellOnGrid(childNode.state.x, childNode.state.y, "blue");
            }

            // Add a delay to visualise the algorithm
            if (isVisualisationDelayOn)
                await timer(visualisationDelayAmount);
        }

        // Fill the cell with colour to visualise the explored set
        fillCellOnGrid(parentNode.state.x, parentNode.state.y, "light-blue");

        if (i++ > 500)
            return;
    }
}

async function approach1() {

    // TODO: get these as arguments
    let startLocation = new State(4, 4);
    let targetLocations = [
        new State(8, 7),
        new State(12, 7),
    ];

    // Fill in the start and goal cells
    // TODO: fix
    fillCellOnGrid(startLocation.x, startLocation.y, "red");
    targetLocations.forEach(location => {
        fillCellOnGrid(location.x, location.y, "green");
    });

    // The initial search finds a path from the start location to the nearest target location
    // The next iteration finds a path from that nearest target location to the next nearest target location
    // Loop repeats until all targets are found
    do {
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

        // Repeat searches until no target locations are left
    } while (targetLocations.length > 0);
}

// TODO: will get deleted
document.getElementById("btn_runBFS").onclick = (_) => {
    approach1();
}