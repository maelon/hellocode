'use strict';

//store.set('global-ratio-x', ratiox); //横向伸缩比
//store.set('global-ratio-y', ratioy); //纵向伸缩比
//store.set('assets-cache', {name: {url, assets}})
//store.set('game-score', {base//基础分, food//食物分, move//移动分, time//时间分, lastFoodType//上次食物类型, startTime//游戏开始时间, endTime//游戏结束时间})
//store.set('map-info', { id//地图id, sourceURL//地图数据源 });
//store.set('reward', boolean//用户是否可以中奖);

const map = {
    '_map': {},
    'has': key => !!map._map[key.toString()],
    'get': key => map._map[key.toString()],
    'set': (key, value) => (map._map[key.toString()] = value)
};
export default map;
