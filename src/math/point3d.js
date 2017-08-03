'use strict';

class Point3D {
    constructor(x, y, z) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get z() {
        return this._z;
    }
}

export default Point3D;
