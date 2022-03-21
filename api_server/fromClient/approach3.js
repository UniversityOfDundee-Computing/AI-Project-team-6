// MinQueue used to help with the Astar method - https://github.com/luciopaiva/heapify
let MinQueue = require("heapify").MinQueue;
const Location = require("./classes").Location;
let GRID_DATA;
let IMPORTS;

/**
 * Calculate the optimal route based on the nearest neighbour approach
 * @param startX
 * @param startY
 * @param points
 * @param translatedRoutes
 * @returns {*[]}
 */
function nearestNeighbourAlgo(startX, startY, points, translatedRoutes) {
    const visitedNodes = new Set();
    const route = [];
    let currentNode = new Location(startX, startY);

    // Iterate until all nodes are visited
    while (route.length < points.length) {
        const node = translatedRoutes.get(currentNode.toString()); // get the routes that can be taken from that node
        let shortestL = Infinity;
        let shortest = null;

        // find the one with the lowest cost / shortest path
        node.forEach((otherNode) => {
            if (otherNode.cost < shortestL && !visitedNodes.has(otherNode.end.toString())) {
                shortestL = otherNode.cost;
                shortest = otherNode;
            }
        });

        // add it to the route and set it to the current node and repeat until complete
        if (shortest !== null) {
            route.push(shortest);
            visitedNodes.add(shortest.start.toString());
            currentNode = shortest.end;
        } else
            return route; // if one of the nodes is unreachable, return route until that point
    }
    return route;
}

/**
 * algorithm 3 - using a* and nearest neighbor for a result
 * @param startX
 * @param startY
 * @param points
 */
exports.algo3 = (imports, startX, startY, points) => {
    IMPORTS = imports;
    GRID_DATA = IMPORTS.GRID_DATA;
    GRID_CELLS_X = IMPORTS.GRID_CELLS_X;
    GRID_CELLS_Y = IMPORTS.GRID_CELLS_Y;

    let routes = [];
    let routesList = [];

    // iterate through points from the start node adding to the routes array
    for (const pointDST of points) {
        const pointSRC = new Location(startX, startY);
        if (!pointSRC.equals(pointDST)) {

            // Paint origin and target cells
            GRID_DATA[startY][startX].c = 2;
            for (let pointsKey in points) {
                GRID_DATA[points[pointsKey].y][points[pointsKey].x].c = 3;
            }

            let path = aStar(pointSRC, pointDST);
            if (path !== null)
                routes.push(reconstructPath(path.cameFrom, path.current));
        }
    }

    // iterate through all other points from all other points adding to the routes array
    for (const pointSRC of points) {
        for (const pointDST of points) {
            if (!pointSRC.equals(pointDST)) {

                // Paint origin and target cells
                GRID_DATA[startY][startX].c = 2;
                for (let pointsKey in points) {
                    GRID_DATA[points[pointsKey].y][points[pointsKey].x].c = 3;
                }

                let path = aStar(pointSRC, pointDST);
                if (path !== null)
                    routes.push(reconstructPath(path.cameFrom, path.current));
            }
        }
    }

    // calculating path cost for each of the routes
    routes.forEach((rte) => {
        const route = {
            cost: 0,
            end: rte[0],
            start: [],
            steps: rte
        };
        rte.forEach((step) => {
            route.start = step;
            route.cost += GRID_DATA[step.y][step.x].v + 1;
        })
        routesList.push(route);
    })

    // translate the routes array into a format more usable in the nearest neighbour algo
    const translatedRoutes = new Map();
    routesList.forEach((rte) => {
        if (!translatedRoutes.has(rte.start.toString()))
            translatedRoutes.set(rte.start.toString(), []);
        translatedRoutes.get(rte.start.toString()).push(rte);
    })

    const route = nearestNeighbourAlgo(startX, startY, points, translatedRoutes);

    // Paint the new cells
    route.forEach((section) => {
        section.steps.reverse().forEach((step) => {
            GRID_DATA[step.y][step.x].c = 4;
        });
    });

    // Paint origin and target cells
    GRID_DATA[startY][startX].c = 2;
    for (let pointsKey in points) {
        GRID_DATA[points[pointsKey].y][points[pointsKey].x].c = 3;
    }

    return route;

}

/**
 * Heuristic function used in A* - simple pythagoras for distance between two points
 * @param pointSRC
 * @param pointDST
 * @returns {number}
 */
function distance(pointSRC, pointDST) {
    return Math.sqrt((pointSRC.x - pointDST.x) * (pointSRC.x - pointDST.x) +
        (pointSRC.y - pointDST.y) * (pointSRC.y - pointDST.y));
}

// A* Algorithm, based on the pseudocode on https://en.wikipedia.org/wiki/A*_search_algorithm
function reconstructPath(cameFrom, current) {
    const total_path = [];
    total_path.push(current);
    let c = current;
    while (cameFrom.has(c)) {
        c = cameFrom.get(c);
        total_path.push(c);
    }
    return total_path;
}


// A* Algorithm, based on the pseudocode on https://en.wikipedia.org/wiki/A*_search_algorithm
function aStar(pointSRC, pointDST) {
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


        // Get the relevant neighbour cells / actions
        const actions = IMPORTS.getNeighbourValues(current.x, current.y);

        // iterate over the neighbours of the current cell
        actions.forEach((current_neighbour) => {
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

    }
    return null;
}