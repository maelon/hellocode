'use strict';

import GameMap from 'game/map';
import GameRole from 'game/role';

class GameScene {
    /**
    * @constructor
    * @description 构建场景
    * @param {Object} config 场景配置
    * @param {Array} config.mapSize 地图尺寸，[行数，列数]
    * @param {Number} config.blockCount 障碍物数量
    * @param {Number} config.coinCount 金币数量
    * @param {Array} config.startPosition 角色在地图上的起始位置，[行，列]
    * @param {Array} config.startDirection  角色在地图上的起始方向，[1,0]行从左至右，[0,1]列从上至下，[-1,0]行从右至左,[0,-1]列从下至上
    * @param {Array} [config.endPosition] 角色最终位置，可以地图之外，［行，列］
    * @param {Array} [config.mapData] 自定义地图数据 
    */
    constructor(config) {
        console.log('scene config', config);
        if(config === undefined) {
            throw new Error('scene config required.');
        }

        const defaultMapData = [];
        const index = config['mapSize'][1] * config['startPosition'][0] + config['startPosition'][1];
        defaultMapData[index] = { 
            'type': GameMap.ELE_TYPE_NORMAL,
            'editable': false,
            'mapType': 'Lot_Meadow'
        };
        this._map = new GameMap(config['mapSize'], config['blockCount'], config['coinCount'], defaultMapData);
        this._role = new GameRole(config['startPosition'], config['startDirection']);

        if(config['endPosition']) {
            if(config['endPosition'] instanceof Array && config['endPosition'].length === 2) {
                this._endPos = config['endPosition'];
                this._endDir = this._calcEndDir();
            }
        }
        this._ended = false;

        if(config['mapData'] !== undefined && config['mapData'] instanceof Array) {
            this._map.mapData = config['mapData'];
        }
    }

    /**
    * @public
    * @description 角色向前移动一步
    * @return {Object} moveState 移动后状态
    * @return {Boolean} moveState.moved 是否移动了
    * @return {Boolean} moveState.ended 是否到终点了
    * @return {Boolean} moveState.blocked 是否碰到碰撞物
    * @return {Boolean} moveState.willBlock 下一步是否碰到碰撞物
    * @return {Boolean} moveState.coined 是否碰到金币
    * @return {Boolean} moveState.willCoin 下一步是否碰到金币
    * @return {Array} moveState.position 到达位置
    * @return {Array} moveState.direction 到达方向
    */
    roleMoveForward(step = 1) {
        if(!this._ended) {
            const moveInfo = this._moveForward(step);
            moveInfo['direction'] = this._role.currentDirection;

            //完成规则
            if(this._endPos) {
                //检测终点
                if(this._endDir) {
                    if(moveInfo['direction'].join(',') === this._endDir.join(',') && Math.abs(moveInfo['position'][0] - this._endPos[0] + moveInfo['position'][1] - this._endPos[1]) === 1) {
                        if(step > 1 || (step > 0 && !moveInfo['moved'])) {
                            this._ended = true;
                            moveInfo['moved'] = true;
                            moveInfo['ended'] = true;
                            moveInfo['position'] = this._endPos;
                        }
                    }
                } else {
                    if(moveInfo['position'].join(',') === this._endPosition.join(',')) {
                        this._ended = true;
                        moveInfo['ended'] = true;
                    }
                }
            } else {
                //吃完所有食物
                let end = true;
                for(let i = 0; i < this._map.mapData.length; i++) {
                    const d = this._map.mapData[i];
                    if(d['type'] === 'coin' && !d['disposed']) {
                        end = false;
                        break;
                    }
                }
                if(end) {
                    this._ended = true;
                    moveInfo['ended'] = true;
                }
            }

            return moveInfo;
        }
        return null;
    }

    /**
     * @public
     * @description 获取角色当前位置
     * @return {Array} 角色当前位置
     */
    get roleCurrentPosition() {
        return this._role.currentPosition;
    }

    /**
     * @public
     * @description 获取角色当前方向
     * @return {Array} 角色当前方向
     */
    get roleCurrentDirection() {
        return this._role.currentDirection;
    }

    /**
     * @public
     * @description 角色向左转动
     * @return {Object} moveState 移动后状态
     * @return {Boolean} moveState.moved 是否移动了
     * @return {Boolean} moveState.ended 是否到终点了
     * @return {Boolean} moveState.blocked 是否碰到碰撞物
     * @return {Boolean} moveState.willBlock 下一步是否碰到碰撞物
     * @return {Boolean} moveState.coined 是否碰到金币
     * @return {Boolean} moveState.willCoin 下一步是否碰到金币
     * @return {Array} moveState.position 到达位置
     * @return {Array} moveState.direction 到达方向
     */
    roleTurnLeft() {
        if(!this._ended) {
            this._role.turnLeft();
            const moveInfo = this._moveForward(0);
            moveInfo['direction'] = this._role.currentDirection;
            return moveInfo;
        }
        return null;
    }

    /**
     * @public
     * @description 角色向右转动
     * @return {Object} moveState 移动后状态
     * @return {Boolean} moveState.moved 是否移动了
     * @return {Boolean} moveState.ended 是否到终点了
     * @return {Boolean} moveState.blocked 是否碰到碰撞物
     * @return {Boolean} moveState.willBlock 下一步是否碰到碰撞物
     * @return {Boolean} moveState.coined 是否碰到金币
     * @return {Boolean} moveState.willCoin 下一步是否碰到金币
     * @return {Array} moveState.position 到达位置
     * @return {Array} moveState.direction 到达方向
     */
    roleTurnRight() {
        if(!this._ended) {
            this._role.turnRight();
            const moveInfo = this._moveForward(0);
            moveInfo['direction'] = this._role.currentDirection;
            return moveInfo;
        }
        return null;
    }

    /**
     * @public
     * @description 获取地图数据
     * @return {Array} mapdata 地图数据
     */
    get mapData() {
        return this._map.mapData;
    }

    /**
     * @private
     * @description 根据终点计算到达终点的角色方向(终点在地图外侧)
     */
    _calcEndDir() {
        if(this._endPos[0] < 0) {
            return [0, -1];
        } else if(this._endPos[0] > this._map.mapSize[0] - 1) {
            return [0, 1]
        } else if(this._endPos[1] < 0) {
            return [-1, 0];
        } else if(this._endPos[1] > this._map.mapSize[1] - 1) {
            return [1, 0];
        }
        return null;
    }

    /**
     * @private
     * @description 向前移动步数
     * @param {Number} step 步数
     */
    _moveForward(step = 1) {
        let moved = false;
        let ended = false;
        let blocked = false;
        let willBlock = false;
        let edged = false;
        let willEdge = false;
        let coined = false;
        let willCoin = false;
        const curPos= this._role.currentPosition;
        const curDir= this._role.currentDirection;
        const mapSize = this._map.mapSize;
        const mapData = this._map.mapData;
        const nextPos = curPos.slice();
        let nextData;
        let forwardData;
        let afterData;
        let realStep;
        if(curDir.join(',') === '1,0') {
            for(let i = curPos[1]; i <= curPos[1] + step; i++) {
                realStep = i - curPos[1];
                nextPos[1] = i;
                if(nextPos[1] > mapSize[1] - 1) {
                    nextData = { 'type': GameMap.ELE_TYPE_EDGE };
                    forwardData = { 'type': GameMap.ELE_TYPE_EDGE };
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else if(nextPos[1] > mapSize[1] - 2) {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = { 'type': GameMap.ELE_TYPE_EDGE };
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else if(nextPos[1] > mapSize[1] - 3) {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = mapData[nextPos[0] * mapSize[1] + nextPos[1] + 1];
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = mapData[nextPos[0] * mapSize[1] + nextPos[1] + 1];
                    afterData = mapData[nextPos[0] * mapSize[1] + nextPos[1] + 2];
                }
                if(nextData['type'] === GameMap.ELE_TYPE_BLOCK || nextData['type'] === GameMap.ELE_TYPE_EDGE) {
                    nextPos[1] -= 1;
                    break;
                }
            }
        } else if(curDir.join(',') === '-1,0') {
            for(let i = curPos[1]; i >= curPos[1] - step; i--) {
                realStep = curPos[1] - i;
                nextPos[1] = i;
                if(nextPos[1] < 0) {
                    nextData = { 'type': GameMap.ELE_TYPE_EDGE };
                    forwardData = { 'type': GameMap.ELE_TYPE_EDGE };
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else if(nextPos[1] < 1) {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = { 'type': GameMap.ELE_TYPE_EDGE };
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else if(nextPos[1] < 2) {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = mapData[nextPos[0] * mapSize[1] + nextPos[1] - 1];
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = mapData[nextPos[0] * mapSize[1] + nextPos[1] - 1];
                    afterData = mapData[nextPos[0] * mapSize[1] + nextPos[1] - 2];
                }
                if(nextData['type'] === GameMap.ELE_TYPE_BLOCK || nextData['type'] === GameMap.ELE_TYPE_EDGE) {
                    nextPos[1] += 1;
                    break;
                }
            }
        } else if(curDir.join(',') === '0,-1') {
            for(let i = curPos[0]; i >= curPos[0] - step; i--) {
                realStep = curPos[0] - i;
                nextPos[0] = i;
                if(nextPos[0] < 0) {
                    nextData = { 'type': GameMap.ELE_TYPE_EDGE };
                    forwardData = { 'type': GameMap.ELE_TYPE_EDGE };
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else if(nextPos[0] < 1) {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = { 'type': GameMap.ELE_TYPE_EDGE };
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else if(nextPos[0] < 2) {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = mapData[(nextPos[0] - 1) * mapSize[1] + nextPos[1]];
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = mapData[(nextPos[0] - 1) * mapSize[1] + nextPos[1]];
                    afterData = mapData[(nextPos[0] - 2) * mapSize[1] + nextPos[1]];
                }
                if(nextData['type'] === GameMap.ELE_TYPE_BLOCK || nextData['type'] === GameMap.ELE_TYPE_EDGE) {
                    nextPos[0] += 1;
                    break;
                }
            }
        } else if(curDir.join(',') === '0,1') {
            for(let i = curPos[0]; i <= curPos[0] + step; i++) {
                realStep = i - curPos[0];
                nextPos[0] = i;
                if(nextPos[0] > mapSize[0] - 1) {
                    nextData = { 'type': GameMap.ELE_TYPE_EDGE };
                    forwardData = { 'type': GameMap.ELE_TYPE_EDGE };
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else if(nextPos[0] > mapSize[0] - 2) {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = { 'type': GameMap.ELE_TYPE_EDGE };
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else if(nextPos[0] > mapSize[0] - 3) {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = mapData[(nextPos[0] + 1) * mapSize[1] + nextPos[1]];
                    afterData = { 'type': GameMap.ELE_TYPE_EDGE };
                } else {
                    nextData = mapData[nextPos[0] * mapSize[1] + nextPos[1]];
                    forwardData = mapData[(nextPos[0] + 1) * mapSize[1] + nextPos[1]];
                    afterData = mapData[(nextPos[0] + 2) * mapSize[1] + nextPos[1]];
                }
                if(nextData['type'] === GameMap.ELE_TYPE_BLOCK || nextData['type'] === GameMap.ELE_TYPE_EDGE) {
                    nextPos[0] -= 1;
                    break;
                }
            }
        }

        if(nextPos.join(',') !== curPos.join(',')) {
            moved = true;
            this._role.currentPosition = nextPos;
        }

        //碰撞物
        if(nextData['type'] === GameMap.ELE_TYPE_EDGE) {
            edged = true;
        } else if(nextData['type'] === GameMap.ELE_TYPE_BLOCK) {
            blocked = true;
        } else {
            if(nextData['type'] === GameMap.ELE_TYPE_COIN) {
                coined = true;
                nextData['disposed'] = true;
            }
            if(forwardData['type'] === GameMap.ELE_TYPE_EDGE) {
                edged = true;
            } else if(forwardData['type'] === GameMap.ELE_TYPE_BLOCK) {
                blocked = true;
            } else if(forwardData['type'] === GameMap.ELE_TYPE_COIN) {
                willCoin = true;
            }

            //下步碰撞物
            if(afterData['type'] === GameMap.ELE_TYPE_EDGE) {
                willEdge = true;
            } else if(afterData['type'] === GameMap.ELE_TYPE_BLOCK) {
                willBlock = true;
            } 
        }

        return {
            'moved': moved,
            'ended': ended,
            'blocked': blocked,
            'willBlock': willBlock,
            'coined': coined,
            'willCoin': willBlock,
            'edged': edged,
            'willEdge': willEdge,
            'position': nextPos,
            'realStep': realStep
        };
    }
}

export default GameScene;
