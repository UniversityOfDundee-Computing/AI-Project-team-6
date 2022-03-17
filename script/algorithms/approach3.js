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
    let currentNode = [startX, startY];

    while (route.length < points.length) {
        const node = translatedRoutes.get(currentNode.toString());
        let shortestL = Infinity;
        let shortest = null;
        node.forEach((otherNode) => {
            if (otherNode.cost < shortestL && !visitedNodes.has(otherNode.end.toString())) {
                shortestL = otherNode.cost;
                shortest = otherNode;
            }
        });
        route.push(shortest);
        visitedNodes.add(shortest.start.toString());
        currentNode = shortest.end;
    }
    return route;
}

/**
 * algorithm 3 - using a* and nearest neighbor for a result
 * @param startX
 * @param startY
 * @param points
 */
function algo3(startX = 0, startY = 0, points = [{x: 0, y: 0}]) {
    let routes = [];
    let routesList = [];

    // itterate through points from the start node adding to the routes array
    points.forEach((pointDST) => {
        const pointSRC = {x: startX, y: startY};
        if (pointSRC !== pointDST) {
            let path = aStar(pointSRC, pointDST);
            if (path !== null)
                routes.push(reconstructPath(path.cameFrom, path.current));
        }
    });

    // itterate through all other points from all other points adding to the routes array
    points.forEach((pointSRC) => {
        points.forEach((pointDST) => {
            if (pointSRC !== pointDST) {
                let path = aStar(pointSRC, pointDST);
                if (path !== null)
                    routes.push(reconstructPath(path.cameFrom, path.current));
            }
        });
    });

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
            route.cost += GRID_DATA[step[1]][step[0]].v + 1;
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
            GRID_DATA[step[1]][step[0]].c = 4;
        });
    });

    // Paint origin and target cells
    GRID_DATA[startY][startX].c = 1;
    for (let pointsKey in points) {
        GRID_DATA[points[pointsKey].y][points[pointsKey].x].c = 2;
    }

    renderGrid();
}

/**
 * Heuristic function used in A* - simple pythagoras for distance btwn two points
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
    const openSet = new MinQueue(GRID_CELLS_Y * GRID_CELLS_X, [], [], Array, Float32Array);
    const openSetList = new Set();
    const startPnt = [pointSRC.x, pointSRC.y];
    openSetList.add(startPnt);
    openSet.push(startPnt, distance(pointSRC, pointDST));
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    for (let y = 0; y < GRID_CELLS_Y; y++) {
        for (let x = 0; x < GRID_CELLS_X; x++) {
            gScore[[x, y]] = Infinity;
            fScore[[x, y]] = Infinity;
        }
    }
    gScore[[pointSRC.x, pointSRC.y]] = 0;
    fScore[[pointSRC.x, pointSRC.y]] = distance(pointSRC, pointDST);

    while (openSet.length > 0) {
        const current = openSet.pop();
        openSetList.delete(current);
        if (current[0] === pointDST.x && current[1] === pointDST.y)
            return {cameFrom, current};

        getNeighbourValues(current[0], current[1]).forEach((nei) => {
            const tentative_gScore = gScore[current] + nei.v + 1;
            const neiPnt = [nei.x, nei.y];
            if (tentative_gScore < gScore[neiPnt]) {
                cameFrom.set(neiPnt, current);
                gScore[neiPnt] = tentative_gScore;
                fScore[neiPnt] = tentative_gScore + distance(nei, pointDST);
                if (!openSetList.has(neiPnt)) {
                    openSet.push(neiPnt, distance(nei, pointDST));
                    openSetList.add(neiPnt);
                }
            }
        });
    }
    return null;
}