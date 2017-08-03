'use strict';

import jutils from 'jutils';

class Animate {
    /**
    * @constructor
    * @description
    * @param {framelist[]} framelist
    * @param {Array} frame.range
    * @param {DOMIMAGE} frame.image
    */
    constructor(fps, framelist, stopimg) {
        this._fps = fps;
        this._frameList = framelist;
        this._currentFrame = -1;
        this._timeStamp = 0;
        this._frameID = 0;
        this._loop = false;
        this._playing = false;
        this._stopimg = stopimg;
        this._MAX_FRAME = (() => {
            let max = 0;
            for(let i = 0; i < this._frameList.length; i++) {
                max = Math.max(max, this._frameList[i]['range'][1]);
            }
            return max;
        })();
    }

    get currentImage() {
        if(this._playing === false && this._currentFrame < 0) {
            return this._stopimg || 'stop';
        }
        for(let i = 0; i < this._frameList.length; i++) {
            if(this._currentFrame >= this._frameList[i]['range'][0] && this._currentFrame <= this._frameList[i]['range'][1]) {
                return this._frameList[i]['image'];
            }
        }
        return null;
    }

    play(frame) {
        this._loop = true;
        this._playing = true;
        this._currentFrame = 0;
        const loopFunc = (timestamp) => {
            if(this._timeStamp === 0) {
                this._timeStamp = timestamp;
            } else {
                if(timestamp - this._timeStamp > 1000 / this._fps) {
                    this._timeStamp  = timestamp;
                    this._currentFrame += 1;
                    if(this._currentFrame >= this._MAX_FRAME) {
                        this._currentFrame = 0;
                    }
                }
            }
            if(this._playing && this._loop) {
                this._frameID = jutils.requestAnimFrame.call(null, loopFunc);
            }
        };
        this._frameID = jutils.requestAnimFrame.call(null, loopFunc);
    }

    pause(frame) {
        //jutils.cancelAnimFrame(this._frameID);
        this._loop = false;
        this._playing = false;
    }

    stop() {
        //jutils.cancelAnimFrame(this._frameID);
        this._loop = false;
        this._currentFrame = -1;
        this._timeStamp = 0;
        this._frameID = 0;
        this._playing = false;
    }
}

export default Animate;
