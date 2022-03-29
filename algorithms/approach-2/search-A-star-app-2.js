// A* Algorithm, based on the pseudocode on https://en.wikipedia.org/wiki/A*_search_algorithm
async function aStar(pointSRC, pointDST) {
    // The nodes that have been discovered, but may still need to be expanded
    // MinQueue is an ordered (priority) queue from the Heapify library, this
    // is used to speed up execution and avoid sorting an array at each step.
    // The Set() is used to store the same information in a format that supports
    // the .has() method allowing for faster searching.
    const openSet = new MinQueue(GRID_CELLS_Y * GRID_CELLS_X, [], [], Location, Float32Array);
    const openSetList = new Set();

    // Add the start point to the datasets
    const startPnt = pointSRC;
    openSetList.add(startPnt);
    openSet.push(startPnt, distance(pointSRC, pointDST));

    // cameFrom stores the parent nodes to all other nodes - allows for path reconstruction
    // gScore stores the cost of the cheapest path to current node
    // fScore stores the estimated cost of the cheapest path to the end via current node
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    // Set default values for gScore and fScore
    for (let y = 0; y < GRID_CELLS_Y; y++) {
        for (let x = 0; x < GRID_CELLS_X; x++) {
            gScore[new Location(x, y)] = Infinity;
            fScore[new Location(x, y)] = Infinity;
        }
    }

    // Add the start point to the datasets
    gScore[new Location(pointSRC.x, pointSRC.y)] = 0;
    fScore[new Location(pointSRC.x, pointSRC.y)] = distance(pointSRC, pointDST);

    // While there are still nodes to expand / re-expand iterate
    while (openSet.length > 0) {
        // pop the current node off the queue (and remove it from the set)
        const current = openSet.pop();
        openSetList.delete(current);

        // test if the current node is the end node if so, return the parents and current node for path reconstruction
        if (current.equals(pointDST))
            return { cameFrom, current };

        // Fill in current node to visualise algorithm
        if (isVisualisationOn)
            fillSquareOnGridFromLocation(current, "rgb(0,0,0)");

        // Get the relevant neighbour cells / actions
        const actions = getNeighbourValues(current.x, current.y);

        // iterate over the neighbours of the current cell
        actions.forEach((current_neighbour) => {
            if (isVisualisationOn)
                fillSquareOnGridFromLocation(current_neighbour, "rgb(0,180,255)");
            // Calculate the score of the current neighbour from the current node
            const tentative_gScore = gScore[current] + current_neighbour.v + 1;

            const current_neighbour_location = new Location(current_neighbour.x, current_neighbour.y);

            // Compare the score with the existing score, if lower add it abd set the parent nodes appropriately
            // add the neighbour to the explorable list
            if (tentative_gScore < gScore[current_neighbour_location]) {
                cameFrom.set(current_neighbour_location, current);
                gScore[current_neighbour_location] = tentative_gScore;
                fScore[current_neighbour_location] = tentative_gScore + distance(current_neighbour, pointDST);
                if (!openSetList.has(current_neighbour_location)) {
                    openSet.push(current_neighbour_location, distance(current_neighbour, pointDST));
                    openSetList.add(current_neighbour_location);
                }
            }
        });

        // Add a delay to visualise the algorithm
        if (isVisualisationDelayOn)
            await timer(visualisationDelayAmount);
    }
    return null;
}