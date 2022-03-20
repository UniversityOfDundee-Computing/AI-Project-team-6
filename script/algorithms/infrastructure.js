// A blueprint for the problem definition, contains the initial state and a goal test
class Problem {
    // Empty values for initial and goal state
    initialState = null;
    goalStates = null;

    // A constructor to initialise Problem instances
    constructor(problem) {
        this.initialState = problem.initialState;
        this.goalStates = problem.goalStates;
    }

    // Goal test returns true if the specified state matches one of the goal states
    goalTest(stateToTest) {
        return checkIfArrayContainsState(this.goalStates, stateToTest);
    }

    /**
     * Returns the possible actions from the specified state
     * @returns [{v:Cell Value/Weight, x: xCoord, y: yCoord, d: compass direction (NESW)}]
     **/
    getActions(state) {
        let x = state.x;
        let y = state.y;

        const rtn = [];
        const cellsToCheck = [-1, 0, 1];
        for (const dirY in cellsToCheck) {
            for (const dirX in cellsToCheck) {
                if (cellsToCheck[dirX] !== 0 || cellsToCheck[dirY] !== 0) {
                    
                    const dir = ((cellsToCheck[dirY] > 0 ? "N" : (cellsToCheck[dirY] < 0 ? "S" : "")) +
                    (cellsToCheck[dirX] > 0 ? "E" : (cellsToCheck[dirX] < 0 ? "W" : ""))); // Determine the compass direction

                    if (
                        x + cellsToCheck[dirX] >= 0 && x + cellsToCheck[dirX] < GRID_CELLS_X &&
                        y + cellsToCheck[dirY] >= 0 && y + cellsToCheck[dirY] < GRID_CELLS_Y &&
                        GRID_DATA[y + cellsToCheck[dirY]][x + cellsToCheck[dirX]].v !== -1
                    ) {
                        // console.log(dir.length);
                        rtn.push({
                            v: (GRID_DATA[y + cellsToCheck[dirY]][x + cellsToCheck[dirX]].v)*dir.length,
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
}

// A blueprint for an element of the state space
// A container for x,y coordinates
class State {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// An blueprint for a Node
class Node {
    // State is its cell location (x,y)
    state = null;
    // Parent is the parent Node
    parent = null;
    // TODO: action class?
    action = null;
    // pathCost is the cumulative path cost
    pathCost = 0;

    // A constructor to initialise Node instances
    constructor(node) {
        this.state = node.state;
        this.parent = node.parent;
        this.action = node.action;
        this.pathCost = node.pathCost;
    }
};
