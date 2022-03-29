// MinQueue used to help with the Astar method - https://github.com/luciopaiva/heapify
let MinQueue = Heapify.MinQueue;

/**
 * algorithm 3 - using a* and nearest neighbor for a result
 * @param startX
 * @param startY
 * @param points
 */
async function runApproach2(startX, startY, points) {

    renderGrid();

    var approach2StartTime = performance.now();
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
            renderGrid();

            let path = await aStar(pointSRC, pointDST);
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
                renderGrid();

                let path = await aStar(pointSRC, pointDST);
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

    var approach2EndTime = performance.now();
    console.log(`Approach 2 (A*): TIME: ${(approach2EndTime-approach2StartTime).toFixed(2)} ms`);
    
    renderGrid();
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

