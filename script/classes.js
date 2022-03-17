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
}