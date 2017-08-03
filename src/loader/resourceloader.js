'use strict';

import jutils from 'jutils';

class AudioLoader {
    constructor(config) {
        this._name = config['name'];
        this._url = config['url'];
        this._callback = config['callback'];
        this.__callback = config['_callback'];
        this._loaded = false;
        this._audio = undefined;
    }

    get sourceLoaded() {
        return this._loaded;
    }

    get sourceName() {
        return this._name;
    }

    get sourceURL() {
        return this._url;
    }

    get sourceCallback() {
        return this.__callback;
    }

    get sourceAssets() {
        return this._audio;
    }

    load() {
        const audio = document.createElement('audio');
        audio.src = this._url;
        //audio.onloadstart = () => {
            //this._loaded = true;
            //audio.onloadedstart = null;
            //if(typeof this._callback === 'function') {
                //this._callback(this);
            //}
        //};
        this._loaded = true;
        //audio.onloadedstart = null;
        if(typeof this._callback === 'function') {
            this._callback(this);
        }
        this._audio = audio;
    }
}

class ImageLoader {
    constructor(config) {
        this._name = config['name'];
        this._url = config['url'];
        this._callback = config['callback'];
        this.__callback = config['_callback'];
        this._loaded = false;
        this._img = undefined;
    }

    get sourceLoaded() {
        return this._loaded;
    }

    get sourceName() {
        return this._name;
    }

    get sourceURL() {
        return this._url;
    }

    get sourceCallback() {
        return this.__callback;
    }

    get sourceAssets() {
        return this._img;
    }

    load() {
        const img = document.createElement('img');
        img.src = this._url;
        img.onload = (e => {
            this._loaded = true;
            if(typeof this._callback === 'function') {
                this._callback(this);
            }
        }).bind(this);
        this._img = img;
    }
}

class ResourceLoader {
    /**
    * @constructor
    * @description
    * @param {Object[] | String[]} source 需要异步加载的资源
    * @param {String} source.name 资源名
    * @param {String} source.url 资源地址
    * @param {String} source.callback 资源加载回调
    */
    constructor(source) {
        if(source instanceof Array) {
            this._source = source;
            this._sourceList = [];
            this._callback = undefined;
            this._progress = undefined;
        } else {
            throw new Error('source should be an array list');
        }
    }
    
    /**
    * @public
    * @description
    */
    load(callback) {
        if(typeof callback === 'function') {
            this._callback = callback;
        }
        const sourceList = [];
        for(let i = 0; i < this._source.length; i++) {
            let fileType;
            let fileURL;
            if(typeof this._source[i] === 'string') {
                fileURL = this._source[i];
            } else {
                fileURL = this._source[i]['url'];
            }
            if((/.(WAV|MP3|WMA|RA|APE|AAC)$/i).test(fileURL)) {
                fileType = 'audio';
            } else if((/.(JPE?G|TIFF|RAW|BMP|GIF|PNG)$/i).test(fileURL)) {
                fileType = 'image';
            }
            let resourceConfig;
            if(typeof this._source[i] === 'string') {
                resourceConfig = {
                    'name': jutils.makeSimpleGUID,
                    'url': fileURL,
                    'callback': this._loadedHandler.bind(this)
                };
            } else {
                resourceConfig = {
                    'name': this._source[i]['name'] || jutils.makeSimpleGUID(),
                    'url': fileURL,
                    'callback': this._loadedHandler.bind(this),
                    '_callback': this._source[i]['callback']
                };
            }
            if(fileType === 'audio') {
                sourceList.push(new AudioLoader(resourceConfig));
            } else if(fileType === 'image') {
                sourceList.push(new ImageLoader(resourceConfig));
            }
        }
        this._sourceList = sourceList;
        for(let i = 0; i < this._sourceList.length; i++) {
            this._sourceList[i].load();
        }
    }

    _loadedHandler(result) {
        const source = this._getSource(result['name']);
        if(source && typeof source.sourceCallback === 'function') {
            source.sourceCallback(source.sourceAssets);
        }

        const loadedList = [];
        for(let i = 0; i < this._sourceList.length; i++) {
            if(this._sourceList[i].sourceLoaded) {
                loadedList.push({
                    'url': this._sourceList[i].sourceURL,
                    'assets': this._sourceList[i].sourceAssets
                });
            }
        }
        const progess = this._getProgress();
        progess['loadedList'] = loadedList;
        (typeof this._callback === 'function') && this._callback(progess);
    }

    _getSource(name) {
        for(let i = 0; i < this._sourceList.length; i++) {
            if(this._sourceList[i].sourceName === name) {
                return this._sourceList[i];
            }
        }
        return null;
    }

    _getProgress() {
        const ret = {
            'totalCount': this._sourceList.length,
            'loadedCount': 0,
            'complete': false
        };
        for(let i = 0; i < this._sourceList.length; i++) {
            if(this._sourceList[i].sourceLoaded) {
                ret['loadedCount'] += 1;
            }
        }
        if(ret['totalCount'] === ret['loadedCount']) {
            ret['complete'] = true;
        }
        return ret;
    }
}

export default ResourceLoader;
