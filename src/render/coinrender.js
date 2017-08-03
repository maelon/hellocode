'use strict';

import store from 'db/store';

import globalConfig from 'root/config';

class CoinRender {
    /**
    * @constructor
    * @description 绘制金币
    * @param {Object} config 金币数据
    * @param {DOMElement} config.canvas 要绘制的canvas
    * @param {Array} config.topPoints 8个顶点位置(三维投蝙后)，如下图
    *                                     4--------5
    *                                    /|       /|
    *                                   / 7------/-6
    *                                  /  /     / /
    *                                 0--------1 /
    *                                 | /      |/
    *                                 3--------2
    * @param {Array} config.mapSize 地图尺寸
    */
    constructor(config) {
        if(config === undefined) {
            throw new Error('lack of config');
        }
        if(config['canvas'] !== undefined) {
            this._canvas = config['canvas'];
        } else {
            throw new Error('no canvas in config');
        }
        if(config['topPoints'] !== undefined) {
            if(config['topPoints'] instanceof Array && config['topPoints'].length === 8) {
                this._topPoints = config['topPoints'];
            } else {
                throw new Error('topPoints in config should be an array, length at 8');
            }
        } else {
            throw new Error('no topPoints in config');
        }
        if(config['mapSize']) {
            this._mapSize = config['mapSize'];
        } else {
            throw new Error('no mapSize in config');
        }

        this._cacheCoinImg = {};
    }

    getCoinCoord(pos) {
        const colLen04X = this._topPoints[0].x - this._topPoints[4].x;
        const colLen04Y = this._topPoints[0].y - this._topPoints[4].y;
        const colLen15X = this._topPoints[1].x - this._topPoints[5].x;
        const colLen15Y = this._topPoints[1].y - this._topPoints[5].y;
        const rowLen54X = this._topPoints[5].x - this._topPoints[4].x;

        //居中平移
        let ymin = this._topPoints[0].y;
        let ymax = this._topPoints[0].y;
        for(let i = 1; i < this._topPoints.length; i++) {
            ymin = Math.min(ymin, this._topPoints[i].y);
            ymax = Math.max(ymax, this._topPoints[i].y);
        }
        const ytrans = (ymin + ymax) * 0.5;

        const ctx = this._canvas.getContext('2d');
        const cvsW = this._canvas.width;
        const cvsH = this._canvas.height;

        const imgW = Math.abs(colLen04X / this._mapSize[0] - rowLen54X / this._mapSize[1]) * 0.8;

        for(let i = 0; i < this._mapSize[0]; i++) {
            for(let j = 0; j < this._mapSize[1]; j++) {
                if(i === pos[0] && j === pos[1]) {
                    const rsx = this._topPoints[4].x + colLen04X * (i + 0.5) / this._mapSize[0];
                    const rsy = this._topPoints[4].y + colLen04Y * (i + 0.5) / this._mapSize[0];
                    const rex = this._topPoints[5].x + colLen15X * (i + 0.5) / this._mapSize[0];
                    const rey = this._topPoints[5].y + colLen15Y * (i + 0.5) / this._mapSize[0];
                    const lenx = rex - rsx;
                    const leny = rey - rsy;
                    const rx = rsx + lenx * (j + 0.5) / this._mapSize[1];
                    const ry = rsy + leny * (j + 0.5) / this._mapSize[1];
                    return [rx - imgW * 0.5 + cvsW * 0.5, ry - imgW - ytrans + cvsH * 0.5 + imgW * 0.25 + 100];
                }
            }
        }
    }

    render(data, bound, bounddir) {
        if(data instanceof Array && data.length === this._mapSize[0] * this._mapSize[1]) {
            const colLen04X = this._topPoints[0].x - this._topPoints[4].x;
            const colLen04Y = this._topPoints[0].y - this._topPoints[4].y;
            const colLen15X = this._topPoints[1].x - this._topPoints[5].x;
            const colLen15Y = this._topPoints[1].y - this._topPoints[5].y;
            const rowLen54X = this._topPoints[5].x - this._topPoints[4].x;

            //居中平移
            let ymin = this._topPoints[0].y;
            let ymax = this._topPoints[0].y;
            for(let i = 1; i < this._topPoints.length; i++) {
                ymin = Math.min(ymin, this._topPoints[i].y);
                ymax = Math.max(ymax, this._topPoints[i].y);
            }
            const ytrans = (ymin + ymax) * 0.5;

            const ctx = this._canvas.getContext('2d');
            const cvsW = this._canvas.width;
            const cvsH = this._canvas.height;

            const boundW = bound[0] + bound[1];

            const imgW = Math.abs(colLen04X / this._mapSize[0] - rowLen54X / this._mapSize[1]) * 0.8;

            for(let i = 0; i < this._mapSize[0]; i++) {
                for(let j = 0; j < this._mapSize[1]; j++) {
                    if((bounddir === 'up' && j < boundW - i)
                      || (bounddir === 'down' && j >= boundW - i)) {
                          const mapd = data[i * this._mapSize[0] + j];
                          if(mapd['type'] === 'coin' 
                             && !mapd['disposed'] ) {
                                 const rsx = this._topPoints[4].x + colLen04X * (i + 0.5) / this._mapSize[0];
                                 const rsy = this._topPoints[4].y + colLen04Y * (i + 0.5) / this._mapSize[0];
                                 const rex = this._topPoints[5].x + colLen15X * (i + 0.5) / this._mapSize[0];
                                 const rey = this._topPoints[5].y + colLen15Y * (i + 0.5) / this._mapSize[0];
                                 const lenx = rex - rsx;
                                 const leny = rey - rsy;
                                 const rx = rsx + lenx * (j + 0.5) / this._mapSize[1];
                                 const ry = rsy + leny * (j + 0.5) / this._mapSize[1];
                                 const imgURI = globalConfig.filePath + 'assets/images/game/' + mapd['coinType'] + '.png';
                                 let imgCvs = this._getCacheCoinImg(imgURI);
                                 if(!imgCvs) {
                                     const imgCache = store.get('assets-cache')[imgURI];
                                     const img = imgCache['assets'];
                                     if(img) {
                                         this._cacheCoinImg[imgURI] = this._rectImage(img);
                                         imgCvs = this._cacheCoinImg[imgURI];
                                     }
                                 }
                                 if(imgCvs) {
                                     ctx.drawImage(imgCvs, rx - imgW * 0.5 + cvsW * 0.5, ry - imgW - ytrans + cvsH * 0.5 + imgW * 0.25 + 100, imgW, imgW);
                                 }
                             }
                      }
                }
            }
        } else {
            throw new Error('render data should be an array, length same as mapdata');
        }
    }

    _getCacheCoinImg(img) {
        for(let s in this._cacheCoinImg) {
            if(s === img) {
                return this._cacheCoinImg[s];
            } 
        }
        return null;
    }

    _rectImage(img) {
        const cvs = document.createElement('canvas');

        const ctx = cvs.getContext('2d');
        const max = Math.max(img.width, img.height);
        cvs.width = max;
        cvs.height = max;
        const x = (max - img.width) * 0.5;
        const y = (max - img.height) * 0.5;
        ctx.drawImage(img, x, y, img.width, img.height);
        return cvs;
    }
}

export default CoinRender;
