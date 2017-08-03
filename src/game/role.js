'use strict';

class GameRole {
    /**
    * @constructor
    * @description 构造角色信息
    * @param {Array} position 角色位置
    * @param {Array} direction 角色方向
    */
    constructor(position, direction) {
        if(position === undefined) {
            throw new Error('position required.');
        }
        if(!(position instanceof Array) || position.length !== 2) {
            throw new Error('position invalid');
        }
        this._currentPos = position;

        if(direction === undefined) {
            throw new Error('direction required.');
        }
        if(!(direction instanceof Array) || direction.length !== 2) {
            throw new Error('direction invalid');
        }
        this._currentDir = direction;
    }

    /**
    * @public
    * @description 获取角色当前位置
    * @return {Array} 角色当前位置
    */
    get currentPosition() {
        return this._currentPos;
    }

    /**
    * @public
    * @description 设置角色当前位置
    * @param {Array} position 角色当前位置
    */
    set currentPosition(position) {
        this._currentPos = position;
    }

    /**
    * @public
    * @description 获取角色当前方向
    * @return {Array} 角色当前方向
    */
    get currentDirection() {
        return this._currentDir;
    }

    /**
    * @public
    * @description 角色向左转动
    */
    turnLeft() {
        const dx = this._currentDir[1] || 0;
        const dy = -this._currentDir[0] || 0;
        this._currentDir = [dx, dy];
    }

    /**
    * @public
    * @description 角色向右转动
    */
    turnRight() {
        const dx = -this._currentDir[1] || 0;
        const dy = this._currentDir[0] || 0;
        this._currentDir = [dx, dy];
    }
}

export default GameRole;
