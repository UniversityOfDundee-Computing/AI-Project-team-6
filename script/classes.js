class Location {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    };
    equals(object) {
        if (object instanceof Location)
            return (this.x === object.x && this.y === object.y);
        return false
    }
    toString() {
        return `Location(${this.x},${this.y})`
    }
}

// class Node {
//     state;
//     parent;
//     action;
//     pathCost;

//     constructor(state, parent, action, pathCost) {
//         this.state = state;
//         this.parent = parent;
//         this.action = action;
//         this.pathCost = pathCost;
//     }
//     toString() {
//         return `Node(${this.state},${this.parent},${this.action},${this.pathCost})`
//     }
// }