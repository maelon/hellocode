'use strict';

import Point3D from 'math/point3d';
import Point2D from 'math/point2d';
import Matrix from 'math/matrix';

class Projection {
    /**
    * @constructor
    * @description 构建透视投影
    * @param {Point3D} vpoint 视点位置
    * @param {Point3D} vangle 旋转角度，绕x 绕y 绕z旋转
    * @param {Number} 投影平面离视角距离
    */
    constructor(vpoint, vangle, f) {
        this._vpoint = vpoint;
        this._vangle = vangle;
        this._f = f;
    }

    projectPoints(points) {
        const pPoints = [];
        for(let i = 0; i < points.length; i++) {
            pPoints.push(this.projectPoint(points[i]));
        }
        return pPoints;
    }

    projectPoint(point) {
        const vpoint = this._vpoint;
        const vangle = this._vangle;
        //绕x轴旋转矩阵
        const Rx = [
            [1, 0, 0],
            [0, Math.cos(-vangle.x), -Math.sin(-vangle.x)],
            [0, Math.sin(-vangle.x), Math.cos(-vangle.x)]
        ];
        //绕y轴旋转矩阵
        const Ry = [
            [Math.cos(-vangle.y), 0, Math.sin(-vangle.y)],
            [0, 1, 0],
            [-Math.sin(-vangle.y), 0, Math.cos(-vangle.y)]
        ];
        //绕z轴旋转矩阵
        const Rz = [
            [Math.cos(-vangle.z), -Math.sin(-vangle.z), 0],
            [Math.sin(-vangle.z), Math.cos(-vangle.z), 0],
            [0, 0, 1]
        ];
        //转换后的空间坐标
        const pointArr = Matrix.multiply(Matrix.multiply(Matrix.multiply(Rx, Ry), Rz), [[point.x - vpoint.x], [point.y - vpoint.y], [point.z - vpoint.z]]);
        const vector = new Point3D(pointArr[0][0], pointArr[1][0], pointArr[2][0]);
        //return new Point2D(vector.x * this._f / vector.z, vector.y * this._f / vector.z);
        return new Point2D(vector.x, vector.y);
        //const vector = new Point3D(point.x - this._vpoint.x, point.y - this._vpoint.y, point.z - this._vpoint.z);
        //return new Point2D(point.x - point.z * vector.x / vector.z, point.y - point.z * vector.y / vector.z);
    }
}

export default Projection;
