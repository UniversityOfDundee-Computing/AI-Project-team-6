let MinQueue = require("heapify").MinQueue;
const {Problem, State, Node} = require("./infrastructure");
let IMPORTS;

function breadthFirstSearch(problem) {

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

    while (true) {

        // Return failure if there are no more nodes to expand in the frontier
        if (frontier.length === 0)
            return null;

        // Get the next node to expand (first-in-first-out from frontier)
        let parentNode = frontier.shift();

        // Add the node to the explored set
        explored.push(parentNode.state);


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
            let isNodeInFrontier = IMPORTS.checkIfArrayContainsNode(frontier, childNode);
            let isNodeInExploredSet = IMPORTS.checkIfArrayContainsState(explored, childNode.state);

            // If not present in either
            if (!isNodeInFrontier && !isNodeInExploredSet) {

                // Return the node if it's the solution
                if (problem.goalTest(childNode.state))
                    return childNode;

                // Add the node to the frontier to be expanded in the next step
                frontier.push(childNode);
            }

        }
    }
}

function uniformCostSearch(problem) {

    // Root node with initial state
    let rootNode = new Node({
        state: problem.initialState,
        parent: null,
        action: null,
        pathCost: 0
    });

    // Create the frontier and explored data structures
    let frontier = new MinQueue(GRID_CELLS_Y * GRID_CELLS_X, [], [], Node, Float32Array);
    let frontierList = [];
    frontier.push(rootNode, rootNode.pathCost);
    frontierList.push(rootNode);
    let explored = [];

    while (true) {

        // Return failure if there are no more nodes to expand in the frontier
        if (frontier.size === 0)
            return null;

        // Get the next node to expand (ordered by priority)
        let parentNode = frontier.pop();
        var indexOfNode = frontierList.indexOf(parentNode);
        frontierList.splice(indexOfNode, 1);

        // Check if this node is the solution
        if (problem.goalTest(parentNode.state)) {
            return parentNode;
        }

        // Add the node to the explored set
        explored.push(parentNode.state);


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
                pathCost: parentNode.pathCost + action.v + 0.1
            });

            // Check if the node is present in the frontier or explored set
            let isNodeInFrontier = IMPORTS.checkIfArrayContainsNode(frontierList, childNode);
            let isNodeInExploredSet = IMPORTS.checkIfArrayContainsState(explored, childNode.state);

            // If not present in either
            if (!isNodeInFrontier && !isNodeInExploredSet) {
                // Check if this node is the solution
                if (problem.goalTest(childNode.state)) {
                    return childNode;
                }
                // Add the node to the frontier to be expanded in the next step
                frontier.push(childNode, childNode.pathCost);
                frontierList.push(childNode);
            }
            // else if ()

        }
    }
}

exports.runAnUninformedSearch = (imports, startLocation, targetLocations, algorithmToUse) => {
    IMPORTS = imports;
    GRID_DATA = IMPORTS.GRID_DATA;
    GRID_CELLS_X = IMPORTS.GRID_CELLS_X;
    GRID_CELLS_Y = IMPORTS.GRID_CELLS_Y;

    const startLocationCopy = startLocation;
    const targetLocationsCopy = targetLocations;

    // The initial search finds a path from the start location to the nearest target location
    // The next iteration finds a path from that nearest target location to the next nearest target location
    // Loop repeats until all targets are found
    let foundTargets = [];
    do {

        // Paint origin and target cells
        GRID_DATA[startLocationCopy.y][startLocationCopy.x].c = 1;
        for (let pointsKey in targetLocationsCopy) {
            GRID_DATA[targetLocationsCopy[pointsKey].y][targetLocationsCopy[pointsKey].x].c = 3;
        }

        let currentProblem = new Problem({
            initialState: startLocation,
            goalStates: targetLocations
        });

        // Execute a search from new start location to any of the remaining targets
        let foundTarget = null;
        if (algorithmToUse == "breadth-first")
            foundTarget = breadthFirstSearch(currentProblem);
        else if (algorithmToUse == "uniform-cost")
            foundTarget = uniformCostSearch(currentProblem);

        foundTargets.push(foundTarget);

        // Set the found target to be the new start location for the next search iteration
        startLocation = foundTarget.state;

        // Remove the target that was last found from the list of targets
        targetLocations = targetLocations.filter(function (value) {
            return !(value.x == foundTarget.state.x && value.y == foundTarget.state.y);
        });

        // Reset the colored frontier and explored set from previous search
        // resetExploredFrontierColors();

        // Paint the new cells
        foundTarget.parent

        // drawPath(foundTarget);
        // Paint origin and target cells
        GRID_DATA[startLocationCopy.y][startLocationCopy.x].c = 1;
        for (let pointsKey in targetLocationsCopy) {
            GRID_DATA[targetLocationsCopy[pointsKey].y][targetLocationsCopy[pointsKey].x].c = 3;
        }

        // Repeat searches until no target locations are left
    } while (targetLocations.length > 0);

    return foundTargets;
}

function drawPath(node) {
    if (node == null)
        return;
    GRID_DATA[node.state.y][node.state.x].c = 4;
    drawPath(node.parent);
}
