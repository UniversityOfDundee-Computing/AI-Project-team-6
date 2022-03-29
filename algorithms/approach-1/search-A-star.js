async function aStarSearch(problem) {

    // Root node with initial state
    let rootNode = new Node({
        state: problem.initialState,
        parent: null,
        action: null,
        pathCost: 0
    });

    // Calculate the evaluation function
    let nodePathCost = rootNode.pathCost;
    let heuristicFunction = distance(rootNode.state, problem.goalStates[0]);
    let evaluationFunction = nodePathCost + heuristicFunction;

    // Create the frontier and explored data structures
    let frontier = new MinQueue(GRID_CELLS_Y * GRID_CELLS_X, [], [], Node, Float32Array);
    let frontierList = [];
    frontier.push(rootNode, evaluationFunction);
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

        // Fill the current cell to visualise which cell is being expanded
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
            let isNodeInFrontier = checkIfArrayContainsNode(frontierList, childNode);
            let isNodeInExploredSet = checkIfArrayContainsState(explored, childNode.state);

            // If not present in either
            if (!isNodeInFrontier && !isNodeInExploredSet) {
                // Check if this node is the solution
                if (problem.goalTest(childNode.state)) {
                    return childNode;
                }
                
                // Calculate the evaluation function
                let nodePathCost = childNode.pathCost;
                let heuristicFunction = distance(childNode.state, problem.goalStates[0]);
                let evaluationFunction = nodePathCost + heuristicFunction;

                // Add the node to the frontier to be expanded in the next step
                frontier.push(childNode, evaluationFunction);
                frontierList.push(childNode);
                
                // Fill the cell with colour to visualise the frontier set
                fillSquareOnGridFromLocation(childNode.state, "blue");
            }

            // Add a delay to visualise the algorithm
            if (isVisualisationDelayOn)
                await timer(visualisationDelayAmount);
        }

        // Fill the cell with colour to visualise the explored set
        fillSquareOnGridFromLocation(parentNode.state, "aqua");

    }
}