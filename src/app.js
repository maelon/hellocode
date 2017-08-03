'use strict';

import jutils from 'jutils';
import store from 'db/store';
import game from './game.js';
import globalConfig from 'root/config';

import './app.css';

(() => {
    const sceneCanvas = document.getElementById('scene');

    const winResize = () => {
        //console.log(document.body.clientWidth);

        const ratiox = document.body.clientWidth / 320;
        const ratioy = document.body.clientHeight / 640;
        document.documentElement.style.fontSize = 16 * ratiox + 'px';
        store.set('global-ratio-x', ratiox);
        store.set('global-ratio-y', ratioy);

        const width = document.body.clientWidth;
        const height = document.body.clientHeight;

        var pixRat = window.devicePixelRatio || 1;
        sceneCanvas.width = width * pixRat;
        sceneCanvas.height = height * pixRat;
        
        // 游戏结束回调
        const gameOverCallback = (data) => {
            var result = {};
            result.step = data.step;
            result.food = data.food;
            result.total = data.total;
            alert(JSON.stringify(result));
        };

        const gameErrorCallback = () => {
            alert('开启游戏异常');
        };
		
        //重绘游戏
        if(game.game_state) {
            game.resetSceneCanvas();
        }

		// 开始
        game.start(sceneCanvas, gameOverCallback, gameErrorCallback);
        insertBGM && insertBGM();
    };
    window.addEventListener('resize', winResize);
    winResize();

    const hengshuping = () => {
        if(window.orientation==180||window.orientation==0){         
            document.getElementById('tipPage').style.display = 'none'; 
        };    
        if(window.orientation==90||window.orientation==-90){ 
            document.getElementById('tipPage').style.display = 'block';     
        }
    };
    ('onorientationchange' in window)  && window.addEventListener('orientationchange', hengshuping, false);

    const insertBGM = () => {
        if(!document.getElementById('bgm-music')) {
            const audio = document.createElement('audio');
            audio.setAttribute('id', 'bgm-music');
            audio.setAttribute('src', globalConfig['filePath'] + 'assets/audio/bgm.mp3');
            audio.setAttribute('autoplay', 'autoplay');
            audio.setAttribute('loop', 'loop');
            audio.play();
            document.body.appendChild(audio);
        } else {
            const audio = document.getElementById('bgm-music');
            audio.play();
        }
    };
    insertBGM();

    if((/android/i).test(window.navigator.userAgent)) {
        document.addEventListener('visibilitychange', () => {
            function getHiddenProp() {
                var prefixes = ['webkit', 'moz', 'ms', 'o'];
                if ('hidden' in document) return 'hidden';
                for (var i = 0; i < prefixes.length; i++){
                    if ((prefixes[i] + 'Hidden') in document) 
                        return prefixes[i] + 'Hidden';
                }
                return null;
            }
            function isHidden() {
                var prop = getHiddenProp();
                if (!prop) return false;
                return document[prop];
            }
            if(isHidden()) {
                const audio = document.getElementById('bgm-music');
                audio && audio.pause();
            } else {
                const audio = document.getElementById('bgm-music');
                audio && audio.play();
            }
        });
    }
})();
