'use strict';

class GameCore {

    /**
    * @constructor
    * @description 初始化数据
    * @param {Array} mapsize 地图尺寸 [3, 2]表示3行2列
    * @param {Array} mapdata 地图数据 [1, 2, 2, 1, 1, 1]表示第1行为[1, 2],第2行为[2, 1],第3行为[1, 1]
    * @param {Array} startpos 角色初始位置 [2, 1]表示角色位于第3行第2列
    * @param {Array} startdir 角色初始方向 [1, 0]表示行从左到右 [-1, 0]表示行从右到左 [0, -1]表示列从上到下 [0, 1]表示列从下到上
    */
    constructor(mapsize, mapdata, startpos, startdir) {
        this._mapsize = mapsize;
        this._mapdata = mapdata;
        this._startpos = startpos.slice();
        this._startdir = startdir.slice();
        this._currentPos = this._startpos.slice();
        this._currentDir = this._startdir.slice();
    }
    
    /**
    * @public
    * @description 向前移动
    * @param {Number} step 移动的步数
    * @return {Object} moveData 移动后环境数据
    * @return {Array} moveData.position 当前位置
    * @return {Number} moveData.positionData 当前位置数据
    * @return {Number} moveData.forwardPositionData 前面位置数据
    * @return {Array} moveData.direction 当前的方向数据 
    */
    moveForward(step) {
        let forwardData;
        if(this._currentDir.join(',') === '1,0') {
            if(step >= this._mapsize[1] - 1 - this._currentPos[1]) {
                this._currentPos[1] = this._mapsize[1] - 1;
                forwardData = -1;
            } else {
                this._currentPos[1] = this._currentPos[1] + step;
                forwardData = this._mapdata[this._currentPos[0] * this._mapsize[1] + this._currentPos[1] + 1];
            }
        } else if(this._currentDir.join(',') === '-1,0') {
            if(step >= this._currentPos[1]) {
                this._currentPos[1] = 0;
                forwardData = -1;
            } else {
                this._currentPos[1] = this._currentPos[1] - step;
                forwardData = this._mapdata[this._currentPos[0] * this._mapsize[1] + this._currentPos[1] - 1];
            }
        } else if(this._currentDir.join(',') === '0,-1') {
            if(step >= this._mapsize[0] - 1 - this._currentPos[0]) {
                this._currentPos[0] = this._mapsize[0] - 1;
                forwardData = -1;
            } else {
                this._currentPos[0] = this._currentPos[0] + step;
                forwardData = this._mapdata[(this._currentPos[0] + 1) * this._mapsize[1] + this._currentPos[1]];
            }
        } else if(this._currentDir.join(',') === '0,1') {
            if(step >= this._currentPos[0]) {
                this._currentPos[0] = 0;
                forwardData = -1;
            } else {
                this._currentPos[0] = this._currentPos[0] - step;
                forwardData = this._mapdata[(this._currentPos[0] - 1) * this._mapsize[1] + this._currentPos[1]];
            }
        }
        return {
            'position': this._currentPos.slice(),
            'positionData': this._mapdata[this._currentPos[0] * this._mapsize[1] + this._currentPos[1]],
            'forwardPositionData': forwardData,
            'direction': this._currentDir.slice()
        };
    }

    /**
    * @public
    * @description 向左原地转动
    * @return {Object} moveData 转动后环境数据
    * @return {Array} moveData.position 当前位置
    * @return {Number} moveData.positionData 当前位置数据
    * @return {Number} moveData.forwardPositionData 前面位置数据
    * @return {Array} moveData.direction 当前的方向数据 
    */
    turnLeft() {
        //坐标转动90度
        const dx = -this._currentDir[1];
        const dy = this._currentDir[0];
        this._currentDir = [dx, dy];
        return this.moveForward(0);
    }

    /**
    * @public
    * @description 向右原地转动
    * @return {Object} moveData 转动后环境数据
    * @return {Array} moveData.position 当前位置
    * @return {Number} moveData.positionData 当前位置数据
    * @return {Number} moveData.forwardPositionData 前面位置数据
    * @return {Array} moveData.direction 当前的方向数据 
    */
    turnRight() {
        //坐标转动-90度
        const dx = this._currentDir[1];
        const dy = -this._currentDir[0];
        this._currentDir = [dx, dy];
        return this.moveForward(0);
    }
}

export default GameCore;
