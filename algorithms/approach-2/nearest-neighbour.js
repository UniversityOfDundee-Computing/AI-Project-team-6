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