'use strict';

import jutils from 'jutils';

import GameScene from 'game/scene';

import MapRender from 'render/maprender';
import RoleRender from 'render/rolerender';
import CoinRender from 'render/coinrender';

import Point3D from 'math/point3d';
import Projection from 'math/projection';
import matrix from 'math/matrix';

import Loader from 'loader/resourceloader';

import store from 'db/store';

import globalConfig from 'root/config';

import './game.css';


const game = {
    'sceneCanvas': undefined,

    'game_state': false, //游戏中true, 游戏未开始或者结束false
    'move_state': false, //移动中true, 移动结束false

    'gameScene': undefined,
    'mapRender': undefined,
    'roleRender': undefined,
    'coinRender': undefined,
    'currentMoveInfo': undefined,
    'currentMovePercent': undefined,

    'gameOverCallback': () => {},

    'gameErrorCallback': () => {},

    'start': (canvas, callback, errorback) => {

        window.location.hash = 'game';

        game.game_state = false;
        game.move_state = false;

        game.sceneCanvas = canvas;
        if(callback && typeof callback === 'function') {
            game.gameOverCallback = callback;
        }
        if(errorback && typeof errorback === 'function') {
            game.gameErrorCallback = errorback;
        }

        const domPage = document.getElementById('page');
        jutils.addClass(domPage, 'hide');
        const domContainer = document.querySelector('.game-container');
        jutils.removeClass(domContainer, 'hide');
        game.showLoading(true);
        game.showGame(false);

        const now = (new Date()).getTime();
        store.set('game-score', {
            'base': globalConfig['base_score'],
            'food': globalConfig['coin'],
            'move': globalConfig['move'],
            'startTime': now,
            'endTime': now,
            'lastFoodType': ''
        });

        game.refreshGameInfo();

        const loadTxt = `<div class="loading-txt">正在准备游戏数据...</div>
                            <div class="loading-progress">
                                <div class="loading-loaded">
                            </div>
                        </div>`;
        const domLoading = document.querySelector('.game-container .game-loading');
        domLoading.innerHTML = loadTxt;

        const domGameNoticeRefresh = document.querySelector('.game-container .game-notice .refresh');
        domGameNoticeRefresh.onclick = game.refreshGameNotice;

        if(globalConfig['random']) {
            store.set('map-info', {
                'mapID': 0
            });
            const list = globalConfig['random_resource'];
            game.loadResource(list, () => {
                const loadTxt = `<div class="loading-txt">正在初始化游戏...</div>
                                    <div class="loading-progress">
                                        <div class="loading-loaded" style="width: 100%;">
                                    </div>
                                </div>`;
                const domLoading = document.querySelector('.game-container .game-loading');
                domLoading.innerHTML = loadTxt;

                game.drawScene();

                setTimeout(() => {
                    game.showLoading(false);
                    game.showGame(true);
                }, 500);
            });
        } else {
            const loadMapSuccess = (result) => {
                const mapData = game.parseMapData(result);
                const list = [];
                for(let i = 0; i < mapData['sourceList'].length; i++) {
                    list.push(globalConfig.filePath + 'assets/images/game/' + mapData['sourceList'][i] + '.png');
                }
                game.loadResource(list, () => {
                    const loadTxt = `<div class="loading-txt">正在初始化游戏...</div>
                                        <div class="loading-progress">
                                            <div class="loading-loaded" style="width: 100%;">
                                        </div>
                                    </div>`;
                    const domLoading = document.querySelector('.game-container .game-loading');
                    domLoading.innerHTML = loadTxt;

                    game.drawScene(mapData['mapData']);

                    setTimeout(() => {
                        game.showLoading(false);
                        game.showGame(true);
                    }, 500);
                });
            };
            const loadMapError = () => {
                game.gameErrorCallback();
            };
            if(globalConfig['localtest']) {
                jutils.ajax({
                    'method': 'get',
                    'url': globalConfig['filePath'] + 'assets/game.json',
                    'dataType': 'json',
                    'success': (result) => {
                        loadMapSuccess(result);
                        store.set('map-info', {
                            'mapID': 0
                        });
                        game.refreshGameNotice();
                    },
                    'error': loadMapError
                });
            } else {
                jutils.ajax({
                    'method': 'get',
                    'url': globalConfig.remoteURL + '/hellobc/map',
                    'dataType': 'json',
                    'success': (result) => {
                        console.log(result);
                        if(result['httpStatusCode'] === 200) {
                            const currentMap = result['data']['map']['this_week'];
                            if(!currentMap || currentMap['wxgame_map_id'] === undefined || currentMap['map_content'] === undefined) {
                                game.gameErrorCallback();
                                return;
                            }
                            loadMapSuccess(JSON.parse(currentMap['map_content']));
                            store.set('map-info', {
                                'mapID': currentMap['wxgame_map_id']
                            });
                            game.refreshGameNotice();
                        } else {
                            game.gameErrorCallback();
                        }
                    },
                    'error': loadMapError
                });
            }
        }
    },

    'loadResource': (list, callback) => {
        if(!store.has('assets-cache')) {
            store.set('assets-cache', {});
        }
        const resourceCache = store.get('assets-cache');

        const sourceList = globalConfig['resource'].concat(list);
        const loader = new Loader(sourceList);
        loader.load(result => {
            const pro = Math.round(result['loadedCount'] * 100 / result['totalCount']);
            const loadTxt = `<div class="loading-txt">正在加载游戏资源...${pro}%</div>
                                <div class="loading-progress">
                                    <div class="loading-loaded" style="width: ${pro}%;">
                                </div>
                            </div>`;
            const domLoading = document.querySelector('.game-container .game-loading');
            domLoading.innerHTML = loadTxt;

            for(let i = 0; i < result.loadedList.length; i++) {
                const resource = result.loadedList[i];
                resourceCache[resource['url']] = {
                    'url': resource['url'],
                    'assets': resource['assets']
                };
            }

            if(result['complete']) {
                callback();
            }
        });
    },

    'drawScene': (mapData) => {

        game.game_state = true;

        const moveAudio = store.get('assets-cache')[globalConfig['filePath'] + 'assets/audio/qmove.mp3']['assets'];
        const eatAudio = store.get('assets-cache')[globalConfig['filePath'] + 'assets/audio/qeat.mp3']['assets'];

        //创建一个虚拟场景
        const gameScene = new GameScene({
            'mapSize': globalConfig['mapSize'], 
            'blockCount': globalConfig['blockCount'], 
            'coinCount': globalConfig['coinCount'], 
            'startPosition': globalConfig['startPosition'], 
            'startDirection': globalConfig['startDirection'], 
            'endPosition': globalConfig['endPosition'],
            'mapData': mapData
        });
        game.gameScene = gameScene;
        game.currentMoveInfo = {
            'position': globalConfig['startPosition'],
            'direction': globalConfig['startDirection']
        };
        game.currentMovePercent = 1;

        //绘制真实场景
        game.clearSceneCanvas();

        const cvsW = game.sceneCanvas.width;
        const cvsH = game.sceneCanvas.height;
        const reflectCubePoints = game.makeCenterCube(cvsW * 0.7, 100, cvsW, cvsH);
        const mapRender = new MapRender({
            'canvas': game.sceneCanvas,
            'topPoints': reflectCubePoints,
            //'showGrid': true,
            'mapSize': globalConfig['mapSize'],
            'mapData': gameScene.mapData,
            'endPosition': globalConfig['endPosition']
        });
        mapRender.render();
        game.mapRender = mapRender;

        const coinRender = new CoinRender({
            'canvas': game.sceneCanvas,
            'topPoints': reflectCubePoints,
            'mapSize': globalConfig['mapSize']
        });
        coinRender.render(gameScene.mapData, globalConfig['startPosition'], 'up');
        game.coinRender = coinRender;

        const roleRender = new RoleRender({
            'canvas': game.sceneCanvas,
            'topPoints': reflectCubePoints,
            'mapSize': globalConfig['mapSize'],
            //'showGrid': true,
            'startPosition': globalConfig['startPosition'],
            'startDirection': globalConfig['startDirection']
        });
        roleRender.render();
        game.roleRender = roleRender;

        coinRender.render(gameScene.mapData, globalConfig['startPosition'], 'down');

        const moveFunc = (moveinfo, endcall) => {
            const COUNT = 50 * 0.2; //0.2秒走一格
            let count = 0;
            let frameID = 0;
            let timeStamp = 0;
            const loopFunc = (ts) => {
                if(timeStamp === 0) {
                    timeStamp = ts;
                    game.clearSceneCanvas();
                    mapRender.render();
                    coinRender.render(gameScene.mapData, moveinfo['position'], 'up');
                    roleRender.render(0, moveinfo['position'], moveinfo['direction']);
                    coinRender.render(gameScene.mapData, moveinfo['position'], 'down');
                    game.currentMoveInfo = moveinfo;
                    game.currentMovePercent = 0;
                } else {
                    if(ts - timeStamp > 1000 / 50) {
                        timeStamp  = ts;
                        count += 1;
                        if(count > COUNT) {
                            const domBtnAble = document.querySelector('.operate-container .operate-able');
                            jutils.removeClass(domBtnAble, 'hide');
                            const domBtnDisable = document.querySelector('.operate-container .operate-disable');
                            jutils.addClass(domBtnDisable, 'hide');
                            game.currentMoveInfo = moveinfo;
                            game.currentMovePercent = 1;
                            endcall();
                        } else {
                            game.clearSceneCanvas();
                            mapRender.render();
                            coinRender.render(gameScene.mapData, moveinfo['position'], 'up');
                            roleRender.render(count / COUNT, moveinfo['position'], moveinfo['direction']);
                            coinRender.render(gameScene.mapData, moveinfo['position'], 'down');
                            game.currentMoveInfo = moveinfo;
                            game.currentMovePercent = count / COUNT;
                        }
                    }
                }
                if(count <= COUNT) {
                    frameID = jutils.requestAnimFrame.call(null, loopFunc);
                } 
            };
            frameID = jutils.requestAnimFrame.call(null, loopFunc);
        };
        const domMoveBtn = document.querySelector('.operate-container .operate-able .move');
        domMoveBtn.onclick = () => {
            //const moveinfo = gameScene.roleMoveForward(Math.max(mapSize[0], mapSize[1]));
            const move = () => {
                const moveinfo = gameScene.roleMoveForward();
                //console.log('move', moveinfo);
                if(moveinfo && moveinfo['moved']) {
                    game.move_state = true;

                    const domBtnAble = document.querySelector('.operate-container .operate-able');
                    jutils.addClass(domBtnAble, 'hide');
                    const domBtnDisable = document.querySelector('.operate-container .operate-disable');
                    jutils.removeClass(domBtnDisable, 'hide');

                    moveFunc(moveinfo, move);

                    const gameScore = store.get('game-score');
                    gameScore['move'] += 1;
                    //console.log('移动计分', store.get('game-score')['move']);

                    let coinMovie = false;
                    let coinPos;
                    if(moveinfo['coined']) {

                        const mapSize = globalConfig['mapSize'];
                        const coinInfo = gameScene.mapData[moveinfo['position'][0] * mapSize[1] + moveinfo['position'][1]];
                        coinPos = coinRender.getCoinCoord(moveinfo['position']);
                        if(!coinInfo['coined']) {
                            coinInfo['coined'] = true;

                            eatAudio.volume = 0.8;
                            eatAudio.currentTime = 0;
                            eatAudio.play();

                            coinMovie = true;

                            //console.log('get coind: ', coinInfo);
                            if(gameScore['lastFoodType'] && coinInfo['coinType'] === gameScore['lastFoodType']) {
                                gameScore['food'] *= 2;
                                //console.log('连续相同食物计分', store.get('game-score')['food']);
                            } else {
                                gameScore['food'] += 1;
                                gameScore['lastFoodType'] = coinInfo['coinType'];
                                //console.log('食物计分', store.get('game-score')['food']);
                            }
                        }
                    } else {
                        moveAudio.volume = 0.8;
                        moveAudio.currentTime = 0;
                        moveAudio.play();
                    }

                    game.refreshGameInfo(coinMovie, coinPos);

                    if(moveinfo['ended']) {
                        setTimeout(() => {

                            game.game_state = false;
                            game.gameScene = undefined;
                            game.mapRender = undefined;
                            game.roleRender = undefined;
                            game.coinRender = undefined;
                            game.currentMoveInfo = undefined;
                            game.currentMovePercent = undefined;

                            const gameScore = store.get('game-score');
                            gameScore['endTime'] = (new Date()).getTime();
                            const time = Math.floor((gameScore['endTime'] - gameScore['startTime']) * 0.001);
                            //const total = gameScore['base'] + gameScore['food'] - gameScore['move'] - time;
                            const total = gameScore['base'] + gameScore['food'] - gameScore['move'];
                            const mapInfo = store.get('map-info');
                            game.gameOverCallback({
                                'map_id': mapInfo['mapID'],
                                'step': gameScore['move'],
                                'food': gameScore['food'],
                                'time': gameScore['endTime'] - gameScore['startTime'],
                                'total': (total < 0 ? 0 : total)
                            });
                        }, 1000);
                    }
                }  else if(moveinfo && !moveinfo['moved']) {
                    game.move_state = false;
                    game.clearSceneCanvas();
                    mapRender.render();
                    coinRender.render(gameScene.mapData, moveinfo['position'], 'up');
                    roleRender.render(-1, moveinfo['position'], moveinfo['direction']);
                    coinRender.render(gameScene.mapData, moveinfo['position'], 'down');
                }
            };
            move();
        };

        const domLeftBtn = document.querySelector('.operate-container .operate-able .left');
        domLeftBtn.onclick = () => {
            if(game.move_state) {
                return ;
            }

            const moveinfo = gameScene.roleTurnLeft();
            //console.log('left', moveinfo);
            if(moveinfo) {

                moveAudio.play();

                game.clearSceneCanvas();
                mapRender.render();
                coinRender.render(gameScene.mapData, moveinfo['position'], 'up');
                roleRender.render(1, moveinfo['position'], moveinfo['direction']);
                coinRender.render(gameScene.mapData, moveinfo['position'], 'down');
                game.currentMoveInfo = moveinfo;
                game.currentMovePercent = 1;
            }
        };

        const domRightBtn = document.querySelector('.operate-container .operate-able .right');
        domRightBtn.onclick = () => {
            if(game.move_state) {
                return ;
            }

            const moveinfo = gameScene.roleTurnRight();
            //console.log('right', moveinfo);
            if(moveinfo) {

                moveAudio.play();

                game.clearSceneCanvas();
                mapRender.render();
                coinRender.render(gameScene.mapData, moveinfo['position'], 'up');
                roleRender.render(1, moveinfo['position'], moveinfo['direction']);
                coinRender.render(gameScene.mapData, moveinfo['position'], 'down');
                game.currentMoveInfo = moveinfo;
                game.currentMovePercent = 1;
            }
        };
    },

    'makeCenterCube': (mapw, maph, cvsw, cvsh) => {
        const cvsW = cvsw;
        const cvsH = cvsh;
        //地图像素尺寸
        const mapW = mapw;
        const mapH = maph;
        //视角转动角度
        const eye_angle_x = -Math.PI * 0.20; //绕x轴
        const eye_angle_y = -Math.PI * 0.25; //绕y轴
        const eye_angle_z = 0; //绕z轴

        //绕x轴旋转矩阵
        const Rx = [
            [1, 0, 0],
            [0, Math.cos(eye_angle_x), -Math.sin(eye_angle_x)],
            [0, Math.sin(eye_angle_x), Math.cos(eye_angle_x)]
        ];
        //绕y轴旋转矩阵
        const Ry = [
            [Math.cos(eye_angle_y), 0, Math.sin(eye_angle_y)],
            [0, 1, 0],
            [-Math.sin(eye_angle_y), 0, Math.cos(eye_angle_y)]
        ];
        //投影平面方向向量
        const dirVector = matrix.multiply(Ry, matrix.multiply(Rx, [[0], [0], [1]]));
        //视角位置
        const eye_x = (cvsW + mapW) * 0.5 - cvsH * 0.5 * dirVector[0][0] / dirVector[1][0];
        const eye_z = - cvsH * 0.5 * dirVector[2][0] / dirVector[1][0];
        //构造地图立方体
        const cubePoints = [
            new Point3D((cvsW - mapW) * 0.5, cvsH * 0.5, 0),
            new Point3D((cvsW + mapW) * 0.5, cvsH * 0.5, 0),
            new Point3D((cvsW + mapW) * 0.5, cvsH * 0.5 + mapH, 0),
            new Point3D((cvsW - mapW) * 0.5, cvsH * 0.5 + mapH, 0),
            new Point3D((cvsW - mapW) * 0.5, cvsH * 0.5, mapW),
            new Point3D((cvsW + mapW) * 0.5, cvsH * 0.5, mapW),
            new Point3D((cvsW + mapW) * 0.5, cvsH * 0.5 + mapH, mapW),
            new Point3D((cvsW - mapW) * 0.5, cvsH * 0.5 + mapH, mapW)
        ];
        const project = new Projection(new Point3D(eye_x, 0, eye_z), new Point3D(eye_angle_x, eye_angle_y, eye_angle_z));
        return project.projectPoints(cubePoints);
    },

    'clearSceneCanvas' : () => {
        //game.sceneCanvas.style.display = 'none';// Detach from DOM  
        //game.sceneCanvas.offsetHeight; // Force the detach  
        //game.sceneCanvas.style.display = 'inherit'; 
        //const width = game.sceneCanvas.width;
        //game.sceneCanvas.width = width - 1;
        //game.sceneCanvas.width = width + 1;
        //const height = game.sceneCanvas.height;
        //game.sceneCanvas.height = height - 1;
        //game.sceneCanvas.height = height + 1;
        //game.sceneCanvas.width = width;
        const ctx = game.sceneCanvas.getContext('2d');
        ctx.clearRect(0, 0, game.sceneCanvas.width, game.sceneCanvas.height);
    },

    'resetSceneCanvas': () => {
        game.clearSceneCanvas();
        game.mapRender.render();
        game.coinRender.render(game.gameScene.mapData, game.currentMoveInfo['position'], 'up');
        const moveinfo = game.currentMoveInfo;
        game.roleRender.render(game.currentMovePercent, moveinfo['position'], moveinfo['direction']);
        game.coinRender.render(game.gameScene.mapData, game.currentMoveInfo['position'], 'down');
    },

    'parseMapData': (data) => {
        const mapData = [];
        const sourceList = [];
        const getTypeByName = name => {
            const normalReg = new RegExp('^' + globalConfig['mapType'] + '_', 'i');
            const coinReg = new RegExp('^' + globalConfig['coinType'] + '_', 'i');
            const startReg = new RegExp('^' + globalConfig['startType'] + '$', 'i');
            if(normalReg.test(name)) {
                return 'normal';
            } else if(coinReg.test(name)) {
                return 'coin';
            } else if(startReg.test(name)) {
                return 'start';
            }
            return '';
        };
        if(data['layers'].length > 0) {
            const ms = data['layers'][0]['data'];
            const mc = {};
            let mapType = '';
            for(let i = 0; i < data['tilesets'].length; i++) {
                const d = data['tilesets'][i];
                const type = getTypeByName(d['name']);
                if(type) {
                    mc['mc' + d['firstgid']] = {};
                    mc['mc' + d['firstgid']]['type'] = type;
                    mc['mc' + d['firstgid']]['editable'] = false;
                    if(type === 'coin') {
                        mc['mc' + d['firstgid']]['coinType'] = d['name'];
                        mc['mc' + d['firstgid']]['disposed'] = false;
                        mc['mc' + d['firstgid']]['mapType'] = mapType;
                    } else if(type === 'normal') {
                        mc['mc' + d['firstgid']]['mapType'] = d['name'];
                    } else if(type === 'start') {
                        mc['mc' + d['firstgid']]['mapType'] = mapType;
                    }
                    if(!(/^q_?$/i).test(d['name']) && sourceList.indexOf(d['name']) < 0) {
                        sourceList.push(d['name']);
                    }
                }
            }
            for(let i = 0; i < ms.length; i++) {
                const d = jutils.clone(mc['mc' + ms[i]] || {});
                if(d['type'] === 'normal') {
                    !mapType && (mapType = d['mapType']);
                    break;
                }
            }
            for(let i = 0; i < ms.length; i++) {
                if(ms[i] === 0) {
                    mapData.push({
                        'type': 'block',
                        'editable': false
                    });
                } else {
                    const d = jutils.clone(mc['mc' + ms[i]] || {});
                    if(d['type'] === 'coin') {
                        !d.mapType && (d.mapType = mapType);
                    } else if(d['type'] === 'start') {
                        d['type'] = 'normal';
                        const col = i % globalConfig['mapSize'][1];
                        const row = parseInt(i / globalConfig['mapSize'][0]);
                        globalConfig['startPosition'] = [row, col];
                        !d['mapType'] && (d['mapType'] = mapType);
                    }
                    mapData.push(d);
                }
            }
        }
        return { mapData, sourceList };
    },

    'showLoading': (show) => {
        const domLoading = document.querySelector('.game-container .game-loading');
        if(show) {
            jutils.removeClass(domLoading, 'hide');
        } else {
            jutils.addClass(domLoading, 'hide');
        }
    },

    'showGame': (show) => {
        const domOperate = document.querySelector('.game-container .operate-container');
        const domGameInfo = document.querySelector('.game-container .game-info');
        const domGameNotice = document.querySelector('.game-container .game-notice');
        if(show) {
            jutils.removeClass(game.sceneCanvas, 'hide');
            jutils.removeClass(domGameInfo, 'hide');
            jutils.removeClass(domGameNotice, 'hide');
            jutils.removeClass(domOperate, 'hide');
        } else {
            jutils.addClass(game.sceneCanvas, 'hide');
            jutils.addClass(domGameInfo, 'hide');
            jutils.addClass(domGameNotice, 'hide');
            jutils.addClass(domOperate, 'hide');
        }
    },

    'refreshGameInfo': (coinmovie, coinpos) => {
        const gameScore = store.get('game-score');
        gameScore['endTime'] = (new Date()).getTime();
        //const time = Math.floor((gameScore['endTime'] - gameScore['startTime']) * 0.001);
        //const total = gameScore['base'] + gameScore['food'] - gameScore['move'] - time;
        const total = gameScore['base'] + gameScore['food'] - gameScore['move'];
        const domScore = document.querySelector('.game-container .game-info .score');
        domScore.innerText = total < 0 ? 0 : total;
        const domStep = document.querySelector('.game-container .game-info .move');
        domStep.innerText = gameScore['move'];
        const domFoodName = document.querySelector('.game-container .game-info .food-name');
        if(gameScore['lastFoodType']) {
            const filePath = globalConfig['filePath'];
            //const icon = store.get('assets-cache')[filePath + 'assets/images/game/' + gameScore['lastFoodType'] + '.png']['assets'].outerHTML;
            const icon = store.get('assets-cache')[filePath + 'assets/images/game/' + gameScore['lastFoodType'] + '.png']['assets'];
            if(coinmovie) {
                const iconPos = [];
                iconPos[0] = jutils.getElementLeft(domFoodName);
                iconPos[1] = jutils.getElementTop(domFoodName);
                const ratio = window.devicePixelRatio || 1;
                const iconOffX = coinpos[0] / ratio - iconPos[0];
                const iconOffY = coinpos[1] / ratio - iconPos[1];
                icon.setAttribute('style', '');
                domFoodName.appendChild(icon);
                setTimeout(() => {
                    icon.setAttribute('style', `
                        animation: flyToCoin 1s forwards;
                        -moz-animation: flyToCoin 1s forwards;
                        -webkit-animation: flyToCoin 1s forwards;
                        -o-animation: flyToCoin 1s forwards;
                        transform-origin: center bottom;
                        -moz-transform-origin: center bottom;
                        -webkit-transform-origin: center bottom;
                        -o-transform-origin: center bottom;
                        transform: matrix(1, 0, 0, 1, ${ iconOffX }, ${ iconOffY });
                        -webkit-transform: matrix(1, 0, 0, 1, ${ iconOffX }, ${ iconOffY });
                        -moz-transform: matrix(1, 0, 0, 1, ${ iconOffX }, ${ iconOffY });
                        -o-transform: matrix(1, 0, 0, 1, ${ iconOffX }, ${ iconOffY });
                    `);
                }, 10);
                game._cleanFoodIcon();
            }
        } else {
            domFoodName.innerHTML = '';
        }
        const domFood = document.querySelector('.game-container .game-info .food');
        domFood.innerText = ': ' + gameScore['food'];
    },

    'refreshGameNotice': () => {
        const domGameNotice = document.querySelector('.game-container .game-notice .notice');
        const domGameNoticeBtn = document.querySelector('.game-container .game-notice .refresh');
        jutils.addClass(domGameNoticeBtn, 'center-rotate');
        const mapID = store.get('map-info')['mapID'];
    },

    '_cleanFoodIcon': () => {
        setTimeout(() => {
            const domFoodName = document.querySelector('.game-container .game-info .food-name');
            while(domFoodName.children.length > 1) {
                domFoodName.removeChild(domFoodName.querySelector('img'));
            }
        }, 600);
    }
}

export default game;
