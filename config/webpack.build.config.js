'use strict'

const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

let config = require('./webpack.config.js');
config.output = {
    'path': path.resolve(__dirname, '../dist'),
    'filename': '[name].[hash].js'
};
config.devtool = false;
//config.module.loaders = [
    //{
        //test: /\.jsx?$/,
        //exclude: /(node_modules|bower_components)/,
        //loader: 'babel',
        //query: {
            //presets: ['es2015']
        //}
    //},
    //{
        //test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
        //exclude: /(node_modules|bower_components)/,
        //loader: 'url',
        //query: {
            //limit: 10000,
            //name: '/images/assets/[name].[hash:7].[ext]'
        //}
    //},
    //{
        //test: /\.css$/,
        //exclude: /(node_modules|bower_components)/,
        //loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
    //}
//];
config.plugins = config.plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
        'compress': {
            'warnings': false
        },
        'exclude': /^config\.js$/
    }),
    new htmlWebpackPlugin({
        //'chunks': ['config', 'utils', 'math', 'game', 'render', 'app'],
        'chunks': ['config', 'utils', 'app'],
        'filename': 'index.html',
        'template': path.resolve(__dirname, '../src/index.html'),
        'inject': true
    })
]);

module.exports = config;
