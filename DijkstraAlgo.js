    const problem = {
        start: {A: 5, B: 2},
        A: {C: 4, D: 2},
        B: {A: 8, D: 7},
        C: {D: 6, E: 3},
        D: {E: 5, finish: 17},
        E: {finish: 3},
        finish: {}
    };

    /*https://hackernoon.com/how-to-implement-dijkstras-algorithm-in-javascript-abdfd1702d04*/
    /*for the basis of the algorithm, changed to fit our directive and what we needed */


    const smallestDistanceNode = (distances, processed) => {
        return Object.keys(distances).reduce((lowest, node) => {
            if (lowest === null || distances[node] < distances[lowest]){
                if (!processed.includes(node)){
                    lowest = node;
                }
            }
            return lowest;
        }, null);
    };

    const dijkstra = (graph) =>{
        const distances = Object.assign({finish: Infinity}, graph.start);
        const parents = {finish: null};
        for(let child in graph.start){
            parents[child] = 'start';
        }
        const processed = [];

        let node = smallestDistanceNode(distances, processed);
        while (node){
            let distance = distances[node];
            let children = graph[node];
            for(let n in children){
                let newDistance = distance + children[n];
                if(!distances[n]){
                    distances[n] = newDistance;
                    parents[n] = node;
                }
                if(distances[n] > newDistance){
                    distances[n] = newDistance;
                    parents[n] = node;
                }
            }
            processed.push(node);
            node = smallestDistanceNode(distances, processed);
        }
        let optimalPath = ['finish'];
        let parent = parents.finish;
        while(parent){
            optimalPath.push(parent);
            parent = parents[parent];
        }

        optimalPath.reverse();

        const results = {
            travelled: distances.finish,
            path: optimalPath
        };
        return results
    };

    console.log(dijkstra(problem));