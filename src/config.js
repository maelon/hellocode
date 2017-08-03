'use strict';

const filePath = './';

const config = {
    //路径
    'filePath': filePath,
    
    //游戏
    'mapSize': [10, 10],
    'blockCount': 8,
    'coinCount': 4,
    'startPosition': [0, 0],
    'startDirection': [1, 0],
    'endPosition': null, //[9, 10]
    'random': true,

    //游戏默认资源列表
    'resource': [
        filePath + 'assets/images/game/role/top/10001.png',
        filePath + 'assets/images/game/role/top/10002.png',
        filePath + 'assets/images/game/role/top/10003.png',
        filePath + 'assets/images/game/role/top/10004.png',
        filePath + 'assets/images/game/role/top/10005.png',
        filePath + 'assets/images/game/role/top/10006.png',
        filePath + 'assets/images/game/role/top/10007.png',
        filePath + 'assets/images/game/role/top/10008.png',
        filePath + 'assets/images/game/role/top/10009.png',
        filePath + 'assets/images/game/role/top/10010.png',
        filePath + 'assets/images/game/role/right/30001.png',
        filePath + 'assets/images/game/role/right/30002.png',
        filePath + 'assets/images/game/role/right/30003.png',
        filePath + 'assets/images/game/role/right/30004.png',
        filePath + 'assets/images/game/role/right/30005.png',
        filePath + 'assets/images/game/role/right/30006.png',
        filePath + 'assets/images/game/role/right/30007.png',
        filePath + 'assets/images/game/role/right/30008.png',
        filePath + 'assets/images/game/role/right/30009.png',
        filePath + 'assets/images/game/role/right/30010.png',
        filePath + 'assets/images/game/role/left/20001.png',
        filePath + 'assets/images/game/role/left/20002.png',
        filePath + 'assets/images/game/role/left/20003.png',
        filePath + 'assets/images/game/role/left/20004.png',
        filePath + 'assets/images/game/role/left/20005.png',
        filePath + 'assets/images/game/role/left/20006.png',
        filePath + 'assets/images/game/role/left/20007.png',
        filePath + 'assets/images/game/role/left/20008.png',
        filePath + 'assets/images/game/role/left/20009.png',
        filePath + 'assets/images/game/role/left/20010.png',
        filePath + 'assets/images/game/role/bottom/40001.png',
        filePath + 'assets/images/game/role/bottom/40002.png',
        filePath + 'assets/images/game/role/bottom/40003.png',
        filePath + 'assets/images/game/role/bottom/40004.png',
        filePath + 'assets/images/game/role/bottom/40005.png',
        filePath + 'assets/images/game/role/bottom/40006.png',
        filePath + 'assets/images/game/role/bottom/40007.png',
        filePath + 'assets/images/game/role/bottom/40008.png',
        filePath + 'assets/images/game/role/bottom/40009.png',
        filePath + 'assets/images/game/role/bottom/40010.png',
        filePath + 'assets/images/game/role/stop/top_stop.png',
        filePath + 'assets/images/game/role/stop/right_stop.png',
        filePath + 'assets/images/game/role/stop/bottom_stop.png',
        filePath + 'assets/images/game/role/stop/left_stop.png',
        filePath + 'assets/images/game/end.png',
        filePath + 'assets/audio/qmove.mp3',
        filePath + 'assets/audio/qeat.mp3'
    ],
    'random_resource': [
        filePath + 'assets/images/game/Lot_Meadow.png',
        filePath + 'assets/images/game/FOOD_Cake.png',
        filePath + 'assets/images/game/FOOD_Sausage.png',
        filePath + 'assets/images/game/FOOD_Mushroom.png'
    ],

    //游戏分值计算
    'base_score': 2000,
    'coin': 0,
    'move': 0,

    //地图
    'mapType': 'lot',
    'coinType': 'food',
    'startType': 'q',

    //test
    'localtest': true
};

export default config;
