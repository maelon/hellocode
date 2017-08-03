'use strict'

const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');

let config = require('./webpack.config.js');
config.entry['index'] = [
    'webpack-dev-server/client?http://localhost:8000/',
    'webpack/hot/dev-server',
    path.resolve(__dirname, '../src/app.js')
];
config.output = {
    'path': path.resolve(__dirname, '../dist'),
    'filename': '[name].[hash].js'
};
config.devtool = 'inline-source-map';
//config.devtool = false;
config.plugins = config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new htmlWebpackPlugin({
        //'chunks': ['config', 'utils', 'math', 'game', 'render', 'appgame', 'app'],
        'chunks': ['config', 'utils', 'app'],
        'filename': 'index.html',
        'template': path.resolve(__dirname, '../src/index.html'),
        'inject': true
    })
]);

module.exports = config;
