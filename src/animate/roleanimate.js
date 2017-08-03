'use strict';

import Animate from 'animate/animate';

import store from 'db/store';

import globalConfig from 'root/config';

class RoleAnimate {
    constructor() {
        this._leftAnimate = undefined;
        this._topAnimate = undefined;
        this._rightAnimate = undefined;
        this._bottomAnimate = undefined;
        this._currentAnimate = undefined;
        this._generateAnimates();
    }

    play() {
        this._currentAnimate.play();
    }

    stop() {
        this._currentAnimate.stop();
    }

    get animateImage() {
        return this._currentAnimate.currentImage;
    }

    turnToRight() {
        this._currentAnimate = this._rightAnimate;
        this._currentAnimate.stop();
    }

    turnToTop() {
        this._currentAnimate = this._topAnimate;
        this._currentAnimate.stop();
    }

    turnToLeft() {
        this._currentAnimate = this._leftAnimate;
        this._currentAnimate.stop();
    }

    turnToBottom() {
        this._currentAnimate = this._bottomAnimate;
        this._currentAnimate.stop();
    }

    _generateAnimates() {
        const fps = 50;
        const imgCache = store.get('assets-cache');
        const frameRange = [
            [0, 0], [1, 1], [2, 2], [3, 3], [4, 4],
            [5, 5], [6, 6], [7, 7], [8, 8], [9, 9]
        ];

        const frameListLeft = [
            {
                'range': frameRange[0],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/left/20001.png']['assets']
            },
            {
                'range': frameRange[1],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/left/20002.png']['assets']
            },
            {
                'range': frameRange[2],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/left/20003.png']['assets']
            },
            {
                'range': frameRange[3],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/left/20004.png']['assets']
            },
            {
                'range': frameRange[4],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/left/20005.png']['assets']
            },
            {
                'range': frameRange[5],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/left/20006.png']['assets']
            },
            {
                'range': frameRange[6],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/left/20007.png']['assets']
            },
            {
                'range': frameRange[7],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/left/20008.png']['assets']
            },
            {
                'range': frameRange[8],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/left/20009.png']['assets']
            },
            {
                'range': frameRange[9],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/left/20010.png']['assets']
            }
        ];
        const lStopImage = imgCache[globalConfig.filePath + 'assets/images/game/role/stop/left_stop.png']['assets'];
        this._leftAnimate = new Animate(fps, frameListLeft, lStopImage);

        const frameListTop = [
            {
                'range': frameRange[0],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/top/10001.png']['assets']
            },
            {
                'range': frameRange[1],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/top/10002.png']['assets']
            },
            {
                'range': frameRange[2],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/top/10003.png']['assets']
            },
            {
                'range': frameRange[3],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/top/10004.png']['assets']
            },
            {
                'range': frameRange[4],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/top/10005.png']['assets']
            },
            {
                'range': frameRange[5],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/top/10006.png']['assets']
            },
            {
                'range': frameRange[6],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/top/10007.png']['assets']
            },
            {
                'range': frameRange[7],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/top/10008.png']['assets']
            },
            {
                'range': frameRange[8],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/top/10009.png']['assets']
            },
            {
                'range': frameRange[9],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/top/10010.png']['assets']
            },
        ];
        const tStopImage = imgCache[globalConfig.filePath + 'assets/images/game/role/stop/top_stop.png']['assets'];
        this._topAnimate = new Animate(fps, frameListTop, tStopImage);

        const frameListRight = [
            {
                'range': frameRange[0],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/right/30001.png']['assets']
            },
            {
                'range': frameRange[1],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/right/30002.png']['assets']
            },
            {
                'range': frameRange[2],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/right/30003.png']['assets']
            },
            {
                'range': frameRange[3],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/right/30004.png']['assets']
            },
            {
                'range': frameRange[4],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/right/30005.png']['assets']
            },
            {
                'range': frameRange[5],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/right/30006.png']['assets']
            },
            {
                'range': frameRange[6],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/right/30007.png']['assets']
            },
            {
                'range': frameRange[7],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/right/30008.png']['assets']
            },
            {
                'range': frameRange[8],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/right/30009.png']['assets']
            },
            {
                'range': frameRange[9],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/right/30010.png']['assets']
            },
        ];
        const rStopImage = imgCache[globalConfig.filePath + 'assets/images/game/role/stop/right_stop.png']['assets'];
        this._rightAnimate = new Animate(fps, frameListRight, rStopImage);

        const frameListBottom = [
            {
                'range': frameRange[0],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/bottom/40001.png']['assets']
            },
            {
                'range': frameRange[1],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/bottom/40002.png']['assets']
            },
            {
                'range': frameRange[2],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/bottom/40003.png']['assets']
            },
            {
                'range': frameRange[3],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/bottom/40004.png']['assets']
            },
            {
                'range': frameRange[4],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/bottom/40005.png']['assets']
            },
            {
                'range': frameRange[5],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/bottom/40006.png']['assets']
            },
            {
                'range': frameRange[6],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/bottom/40007.png']['assets']
            },
            {
                'range': frameRange[7],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/bottom/40008.png']['assets']
            },
            {
                'range': frameRange[8],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/bottom/40009.png']['assets']
            },
            {
                'range': frameRange[9],
                'image': imgCache[globalConfig.filePath + 'assets/images/game/role/bottom/40010.png']['assets']
            },
        ];
        const bStopImage = imgCache[globalConfig.filePath + 'assets/images/game/role/stop/bottom_stop.png']['assets'];
        this._bottomAnimate = new Animate(fps, frameListBottom, bStopImage);
    }
}

export default RoleAnimate;
