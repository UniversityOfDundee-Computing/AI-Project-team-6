
function breadthFirstSearch() {
    let startLocation = {
        x: 4,
        y: 4
    };
    let goalLocation = {
        x: 8,
        y: 7
    }

    fillSquareOnGrid(goalLocation.x, goalLocation.y, "rgba(0,255,0,0.8)");
    fillSquareOnGrid(startLocation.x, startLocation.y, "rgba(255,255,0,0.8)");

    // root node
    // TODO make a class
    let node = {
        state: startLocation,
        parent: null,
        action: null,
        pathCost: 0
    };

    // todo make goal test function
    if (node.state === goalLocation) {
        return node;
    }

    let frontier = [node];
    let explored = [];

    let i = 0;
    while (true) {

        if (frontier.length === 0)
            return null;

        node = frontier.shift();
        explored.push(node.state);
        // console.log(node.state);
        // console.log(explored);

        let actions = getNeighbourValues(node.state.x, node.state.y);

        console.log(node);
        explored.forEach(state => {
            if (state.x !== startLocation.x || state.y !== startLocation.y)
                fillSquareOnGrid(state.x, state.y, "rgba(173,216,230,0.8)");
        });

        frontier.forEach(node => {
            fillSquareOnGrid(node.state.x, node.state.y, "rgba(0,0,255,0.8)");
        });

        for (let i = 0; i < actions.length; i++) {
            let action = actions[i];

            let currentLocation = {
                x: action.x,
                y: action.y
            }

            const child = {
                state: currentLocation,
                parent: node,
                // TODO: unsure about action
                action: action,
                pathCost: node.pathCost + action.v
            };

            // TODO rewrite
            let matchingInFrontier = frontier.some(e => {
                return (e.state.x === child.state.x && e.state.y === child.state.y)
            });

            let matchingInExplored = explored.some(e => {
                return (e.x === child.state.x && e.y === child.state.y)
            });


            if (!matchingInFrontier && !matchingInExplored) {
                // console.log(child.state.x + " " + child.state.y);
                if (child.state.x === goalLocation.x && child.state.y === goalLocation.y)
                    return child;

                frontier.push(child);
                // console.log('matching none');
            } else {
                // console.log('matching both');
            }
        }

        if (i++ > 500)
            return;
    }
}