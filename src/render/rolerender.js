'use strict';

import jutils from 'jutils';

import RoleAnimate from 'animate/roleanimate';

class RoleRender {
    /**
    * @constructor
    * @description 绘制角色
    * @param {Object} config 角色数据
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
    * @param {Array} [config.startPosition] 角色起始位置
    * @param {Array} [config.startDirection] 角色起始角度
    * @param {Boolean} [config.showGrid] 显示网格
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
        if(config['startPosition']) {
            this._pos = config['startPosition'];
        }
        if(config['startDirection']) {
            this._dir = config['startDirection'];
        }
        this._showGrid = config['showGrid'] || false;

        this._roleAnimate = new RoleAnimate();
        this._roleAnimate.turnToRight();
        this._cacheAnimateImg = {}; //{'id': {'img': animateimg, 'cvs': rectcvs}}
    }

    render(rate = -1, pos = this._pos, dir = this._dir) {
        let coord;

        if(dir.join(',') !== this._dir.join(',')) {
            this._dir = dir;
            if(dir.join(',') === '1,0') {
                this._roleAnimate.turnToRight();
            } else if(dir.join(',') === '-1,0') {
                this._roleAnimate.turnToLeft();
            } else if(dir.join(',') === '0,-1') {
                this._roleAnimate.turnToTop();
            } else if(dir.join(',') === '0,1') {
                this._roleAnimate.turnToBottom();
            }
        }

        if(pos.join(',') !== this._pos.join(',')) {
            if(rate === 0) {
                this._roleAnimate.play();
            } else if(rate === 1) {
                this._pos = pos;
            } else if(rate === -1) {
                this._roleAnimate.stop();
                this._pos = pos;
            }
            const startCoord = this._getRoleCoord(this._pos);
            const endCoord = this._getRoleCoord(pos);
            const lenx = endCoord[0] - startCoord[0];
            const leny = endCoord[1] - startCoord[1];
            const x = startCoord[0] + lenx * rate;
            const y = startCoord[1] + leny * rate;
            coord = [x, y];
        } else {
            coord = this._getRoleCoord(this._pos);
            if(rate === -1) {
                this._roleAnimate.stop();
                this._pos = pos;
            }
        }

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

        if(this._showGrid) {
            for(let i = 0; i < this._mapSize[0]; i++) {
                for(let j = 0; j < this._mapSize[1]; j++) {
                    const rsx = this._topPoints[4].x + colLen04X * (i + 0.5) / this._mapSize[0];
                    const rsy = this._topPoints[4].y + colLen04Y * (i + 0.5) / this._mapSize[0];
                    const rex = this._topPoints[5].x + colLen15X * (i + 0.5) / this._mapSize[0];
                    const rey = this._topPoints[5].y + colLen15Y * (i + 0.5) / this._mapSize[0];
                    const lenx = rex - rsx;
                    const leny = rey - rsy;
                    const rx = rsx + lenx * (j + 0.5) / this._mapSize[1];
                    const ry = rsy + leny * (j + 0.5) / this._mapSize[1];
                    ctx.fillStyle = 'red';
                    ctx.beginPath();
                    ctx.arc(rx + cvsW * 0.5, ry - ytrans + cvsH * 0.5, 4, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }

        //画图
        const ctx = this._canvas.getContext('2d');
        const cvsW = this._canvas.width;
        const cvsH = this._canvas.height;

        const img = this._roleAnimate.animateImage;
        const cacheImg = this._getCacheAnimateImg(img);
        let imgCvs;
        if(cacheImg) {
            imgCvs = cacheImg;
        } else {
            const cacheCvs = this._rectImage(img);
            this._cacheAnimateImg[jutils.makeSimpleGUID()] = {
                'img': img,
                'cvs': cacheCvs
            };
            imgCvs = cacheCvs;
        }
        const imgW = Math.abs(colLen04X / this._mapSize[0] - rowLen54X / this._mapSize[1]) * 1.4;
        ctx.drawImage(imgCvs, coord[0] - imgW * 0.5 + cvsW * 0.5, coord[1] - imgW - ytrans + cvsH * 0.5 + 105, imgW, imgW);
    }

    _getCacheAnimateImg(img) {
        for(let s in this._cacheAnimateImg) {
            if(this._cacheAnimateImg[s]) {
                if(this._cacheAnimateImg[s]['img'] === img) {
                    return this._cacheAnimateImg[s]['cvs'];
                }
            } 
        }
        return null;
    }

    _getRoleCoord(pos) {
        const colLen04X = this._topPoints[0].x - this._topPoints[4].x;
        const colLen04Y = this._topPoints[0].y - this._topPoints[4].y;
        const colLen15X = this._topPoints[1].x - this._topPoints[5].x;
        const colLen15Y = this._topPoints[1].y - this._topPoints[5].y;
        const rowLen54X = this._topPoints[5].x - this._topPoints[4].x;


        const rsx = this._topPoints[4].x + colLen04X * (pos[0] + 0.5) / this._mapSize[0];
        const rsy = this._topPoints[4].y + colLen04Y * (pos[0] + 0.5) / this._mapSize[0];
        const rex = this._topPoints[5].x + colLen15X * (pos[0] + 0.5) / this._mapSize[0];
        const rey = this._topPoints[5].y + colLen15Y * (pos[0] + 0.5) / this._mapSize[0];
        const lenx = rex - rsx;
        const leny = rey - rsy;
        const rx = rsx + lenx * (pos[1] + 0.5) / this._mapSize[1];
        const ry = rsy + leny * (pos[1] + 0.5) / this._mapSize[1];
        return [rx, ry];
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

export default RoleRender;
