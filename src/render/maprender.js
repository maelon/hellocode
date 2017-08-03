'use strict';

import store from 'db/store';

import globalConfig from 'root/config';

class MapRender {
    /**
    * @constructor
    * @description 绘制地图(矩形)
    * @param {Object} config 地图数据
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
    * @param {Array} config.mapData 地图数据
    * @param {Array} config.endPosition 终点位置
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
        if(config['mapData']) {
            this._mapData = config['mapData'];
        } else {
            throw new Error('no mapData in config');
        }
        if(config['endPosition'] && config['endPosition'] instanceof Array && config['endPosition'].length === 2) {
            this._endPosition = config['endPosition'];
        }
        this._showGrid = config['showGrid'] || false;

        this._cacheMap = undefined;
        //this._mapImg = this._rectImage(store.get('assets-cache')[globalConfig.filePath + 'assets/images/game/dikuai_green.png']['assets']);
        if(this._endPosition) {
            this._endImg = this._rectImage(store.get('assets-cache')[globalConfig.filePath + 'assets/images/game/end.png']['assets']);
        }
    }

    render() {
        if(!this._cacheMap) {
            this._cacheMap = document.createElement('canvas');
            this._cacheMap.width = this._canvas.width;
            this._cacheMap.height = this._canvas.height;
            const ctx = this._cacheMap.getContext('2d');

            const colLen40X = this._topPoints[4].x - this._topPoints[0].x;
            const colLen40Y = this._topPoints[4].y - this._topPoints[0].y;
            const colLen51X = this._topPoints[5].x - this._topPoints[1].x;
            const colLen51Y = this._topPoints[5].y - this._topPoints[1].y;
            const rowLen10X = this._topPoints[1].x - this._topPoints[0].x;
            const rowLen10Y = this._topPoints[1].y - this._topPoints[0].y;
            const rowLen54X = this._topPoints[5].x - this._topPoints[4].x;
            const rowLen54Y = this._topPoints[5].y - this._topPoints[4].y;
            const rowLen23X = this._topPoints[2].x - this._topPoints[3].x;
            const rowLen23Y = this._topPoints[2].y - this._topPoints[3].y;
            const colLen62X = this._topPoints[6].x - this._topPoints[2].x;
            const colLen62Y = this._topPoints[6].y - this._topPoints[2].y;

            //居中平移
            let ymin = this._topPoints[0].y;
            let ymax = this._topPoints[0].y;
            for(let i = 1; i < this._topPoints.length; i++) {
                ymin = Math.min(ymin, this._topPoints[i].y);
                ymax = Math.max(ymax, this._topPoints[i].y);
            }
            const ytrans = (ymin + ymax) * 0.5;

            //画图
            const cvsW = this._cacheMap.width;
            const cvsH = this._cacheMap.height;

            const imgW = Math.abs(-colLen40X / this._mapSize[0] - rowLen54X / this._mapSize[1]);

            for(let i = 0; i < this._mapSize[0]; i++) {
                const bsx = this._topPoints[0].x + colLen40X * (this._mapSize[0] - i) / this._mapSize[0];
                const bsy = this._topPoints[0].y + colLen40Y * (this._mapSize[0] - i) / this._mapSize[0];
                const bex = this._topPoints[1].x + colLen51X * (this._mapSize[0] - i) / this._mapSize[0];
                const bey = this._topPoints[1].y + colLen51Y * (this._mapSize[0] - i) / this._mapSize[0];
                const lenx = bex - bsx;
                const leny = bey - bsy;
                for(let j = 0; j < this._mapSize[1]; j++) {
                    const type = this._mapData[i * this._mapSize[1] + j]['type'];
                    if(type !== undefined && type === 'block') {
                    } else {
                        if(this._endPosition && i === this._endPosition[0] && j === this._endPosition[1]) {
                            ctx.drawImage(this._endImg, bsx + lenx * j / this._mapSize[1] - imgW * 0.5 + cvsW * 0.5, bsy + leny * j / this._mapSize[1] - ytrans + cvsH * 0.5 - 4, imgW + 0, imgW);
                        } else {
                            const mapType = this._mapData[i * this._mapSize[1] + j]['mapType'];
                            const imgCache = store.get('assets-cache')[globalConfig.filePath + 'assets/images/game/' + mapType + '.png'];
                            const img = imgCache && imgCache['assets'];
                            if(img) {
                                ctx.drawImage(this._rectImage(img), bsx + lenx * j / this._mapSize[1] - imgW * 0.5 + cvsW * 0.5, bsy + leny * j / this._mapSize[1] - ytrans + cvsH * 0.5 - 4, imgW + 0, imgW);
                            }
                        }
                    }
                }
            }

            if(this._endPosition) {
                if(this._endPosition[0] < 0 || this._endPosition[0] > this._mapSize[0] - 1
                    || this._endPosition[1] < 0 || this._endPosition[1] > this._mapSize[1] - 1) {
                    const rsx = this._topPoints[4].x + (-colLen40X) * this._endPosition[0] / this._mapSize[0];
                    const rsy = this._topPoints[4].y + (-colLen40Y) * this._endPosition[0] / this._mapSize[0];
                    const rex = this._topPoints[5].x + (-colLen51X) * this._endPosition[0] / this._mapSize[0];
                    const rey = this._topPoints[5].y + (-colLen51Y) * this._endPosition[0] / this._mapSize[0];
                    const lenx = rex - rsx;
                    const leny = rey - rsy;
                    const rx = rsx + lenx * this._endPosition[1] / this._mapSize[1];
                    const ry = rsy + leny * this._endPosition[1] / this._mapSize[1];
                    const imgW = Math.abs(-colLen40X / this._mapSize[0] - rowLen54X / this._mapSize[1]);
                    ctx.drawImage(this._endImg, rx - imgW * 0.5 + cvsW * 0.5, ry - ytrans + cvsH * 0.5 - 4, imgW, imgW);
                }
            }

            if(this._showGrid) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.beginPath();

                //0154面的横线
                for(let i = 0; i <= this._mapSize[0]; i++) {
                    ctx.moveTo(this._topPoints[0].x + colLen40X * i / this._mapSize[0] + cvsW * 0.5, this._topPoints[0].y + colLen40Y * i / this._mapSize[0] - ytrans + cvsH * 0.5);
                    ctx.lineTo(this._topPoints[1].x + colLen51X * i / this._mapSize[0] + cvsW * 0.5, this._topPoints[1].y + colLen51Y * i / this._mapSize[0] - ytrans + cvsH * 0.5);
                }
                //0154面的纵线
                for(let i = 0; i <= this._mapSize[1]; i++) {
                    ctx.moveTo(this._topPoints[0].x + rowLen10X * i / this._mapSize[1] + cvsW * 0.5, this._topPoints[0].y + rowLen10Y * i / this._mapSize[1] - ytrans + cvsH * 0.5);
                    ctx.lineTo(this._topPoints[4].x + rowLen54X * i / this._mapSize[1] + cvsW * 0.5, this._topPoints[4].y + rowLen54Y * i / this._mapSize[1] - ytrans + cvsH * 0.5);
                }

                //32棱线
                ctx.moveTo(this._topPoints[3].x + cvsW * 0.5, this._topPoints[3].y - ytrans + cvsH * 0.5);
                ctx.lineTo(this._topPoints[2].x + cvsW * 0.5, this._topPoints[2].y - ytrans + cvsH * 0.5);
                //1023面的纵线
                for(let i = 0; i <= this._mapSize[1]; i++) {
                    ctx.moveTo(this._topPoints[0].x + rowLen10X * i / this._mapSize[1] + cvsW * 0.5, this._topPoints[0].y + rowLen10Y * i / this._mapSize[1] - ytrans + cvsH * 0.5);
                    ctx.lineTo(this._topPoints[3].x + rowLen23X * i / this._mapSize[1] + cvsW * 0.5, this._topPoints[3].y + rowLen23Y * i / this._mapSize[1] - ytrans + cvsH * 0.5);
                }

                //26棱线
                ctx.moveTo(this._topPoints[2].x + cvsW * 0.5, this._topPoints[2].y - ytrans + cvsH * 0.5);
                ctx.lineTo(this._topPoints[6].x + cvsW * 0.5, this._topPoints[6].y - ytrans + cvsH * 0.5);
                //1562面的横线
                for(let i = 0; i <= this._mapSize[0]; i++) {
                    ctx.moveTo(this._topPoints[1].x + colLen51X * i / this._mapSize[0] + cvsW * 0.5, this._topPoints[1].y + colLen51Y * i / this._mapSize[0] - ytrans + cvsH * 0.5);
                    ctx.lineTo(this._topPoints[2].x + colLen62X * i / this._mapSize[0] + cvsW * 0.5, this._topPoints[2].y + colLen62Y * i / this._mapSize[0] - ytrans + cvsH * 0.5);
                }

                ctx.stroke();
            }
        }

        const ctx = this._canvas.getContext('2d');
        ctx.drawImage(this._cacheMap, 0, 100, this._canvas.width, this._canvas.height);
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

export default MapRender;
