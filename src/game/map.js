'use strict';

class GameMap {

    /**
    * @constructor
    * @description 构造地图信息
    * @param {Array} mapsize 地图尺寸
    * @param {Number} blockcount 障碍物数量，随机分布，如需要自定义，请使用set mapData
    * @param {Number} coincount 金币数量，随机分布，如需要自定义，请使用set mapData
    * @param {Array} defaultmapdata 预设mapdata
    *                               data值为
    *                               {
    *                                   type: 0, //0正常地图 1障碍物 2金币
    *                                   editable: false //type值是否可改
    *                                   ...
    *                               }
    */
    constructor(mapsize, blockcount = 0, coincount = 0, defaultmapdata = []) {
        if(mapsize === undefined) {
            throw new Error('Please input mapsize.');
        }
        if(mapsize instanceof Array && mapsize.length === 2) {
            this._mapSize = mapsize;
        } else {
            throw new Error('mapsize should be an array, length of 2.');
        }
        this._mapData = defaultmapdata;
        this._generateMapBlock(blockcount);
        this._generateMapCoin(coincount);
    }

    static get ELE_TYPE_NORMAL() {
        return 'normal';
    }

    static get ELE_TYPE_BLOCK() {
        return 'block';
    }

    static get ELE_TYPE_COIN() {
        return 'coin';
    }

    static get ELE_TYPE_EDGE() {
        return 'edge';
    }

    /**
    * @public
    * @description 获取地图尺寸
    * @return {Array} 地图数据
    */
    get mapSize() {
        return this._mapSize;
    }

    /**
    * @public
    * @description 设置自定义地图数据
    * @param {Array} data 地图数据
    */
    set mapData(data) {
        this._mapData = data;
    }

    /**
    * @public
    * @description 获取地图数据
    * @return {Array} 地图数据
    */
    get mapData() {
        return this._mapData;
    }

    /**
    * @private
    * @description 根据障碍物数量，随机生成地图数据
    * @param {Number} blockcount 障碍物数量
    * @return {Array} 地图数据
    */
    _generateMapBlock(blockcount) {
        const indexes= [];
        for(let i = 0; i < this._mapSize[0] * this._mapSize[1]; i++) {
            if(this._mapData[i] && this._mapData[i]['editable'] !== undefined && !this._mapData[i]['editable']) {
            } else {
                indexes.push(i);
                this._mapData[i] = {
                    'type': GameMap.ELE_TYPE_NORMAL,
                    'editable': true,
                    'mapType': 'Lot_Meadow'
                };
            }
        }
        const indexArr = [];
        for(let i = 0; i < blockcount; i++) {
            if(indexes.length > 0) {
                indexArr.push(indexes.splice(Math.floor(Math.random() * indexes.length), 1).pop());
            }
        }
        for(let i = 0; i < indexArr.length; i++) {
            this._mapData[indexArr[i]] = {
                'type': GameMap.ELE_TYPE_BLOCK,
                'editable': false
            };
        }
    }

    /**
    * @private
    * @description 根据金币数量，随机生成地图数据
    * @param {Number} coincount 金币数量
    * @return {Array} 地图数据
    */
    _generateMapCoin(coincount) {
        const indexes= [];
        for(let i = 0; i < this._mapSize[0] * this._mapSize[1]; i++) {
            if(this._mapData[i] && this._mapData[i]['editable'] !== undefined && !this._mapData[i]['editable']) {
            } else {
                indexes.push(i);
            }
        }
        const indexArr = [];
        for(let i = 0; i < coincount; i++) {
            if(indexes.length > 0) {
                indexArr.push(indexes.splice(Math.floor(Math.random() * indexes.length), 1).pop());
            }
        }
        for(let i = 0; i < indexArr.length; i++) {
            this._mapData[indexArr[i]] = {
                'type': GameMap.ELE_TYPE_COIN,
                'coinType': (['FOOD_Sausage', 'FOOD_Mushroom', 'FOOD_Cake'].splice(Math.floor(Math.random() * 3), 1)).pop(),
                'mapType': 'Lot_Meadow',
                'editable': false,
                'disposed': false,
                'coined': false
            };
        }
    }
}

export default GameMap;
