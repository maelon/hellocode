'use strict'

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    'entry': {
        'config': [ path.resolve(__dirname, '../src/config.js') ],
        'utils': [ path.resolve(__dirname, '../src/libs/jUtils.js') ],
        //'math': [ 
            //path.resolve(__dirname, '../src/math/point2d.js'),
            //path.resolve(__dirname, '../src/math/point3d.js'),
            //path.resolve(__dirname, '../src/math/projection.js')
        //],
        //'game': [ 
            //path.resolve(__dirname, '../src/game/scene.js'),
            //path.resolve(__dirname, '../src/game/map.js'),
            //path.resolve(__dirname, '../src/game/role.js')
        //],
        //'render': [
            //path.resolve(__dirname, '../src/render/maprender.js'),
            //path.resolve(__dirname, '../src/render/coinrender.js'),
            //path.resolve(__dirname, '../src/render/rolerender.js')
        //],
        //'appgame': [ path.resolve(__dirname, '../src/game.js') ],
        'app': [ path.resolve(__dirname, '../src/app.js') ]
    },
    'output': {
        'path': path.resolve(__dirname, '../dist'),
        'filename': '[name].[chunkhash].js',
        'sourceMapFilename': '[name].[chunkhash].js.map'
    },
    'devtool': 'source-map',
    'resolve': {
        'alias': {
            'math': path.resolve(__dirname, '../src/math'),
            'gamecore': path.resolve(__dirname, '../src/gamecore'),
            'game': path.resolve(__dirname, '../src/game'),
            'render': path.resolve(__dirname, '../src/render'),
            'animate': path.resolve(__dirname, '../src/animate'),
            'loader': path.resolve(__dirname, '../src/loader'),
            'db': path.resolve(__dirname, '../src/db'),
            'root': path.resolve(__dirname, '../src')
        },
		'extensions': ['', '.js']
	},
    'externals': {
        'jutils': 'jUtils'
    },
    'resolveLoader': {
        'modulesDirectories': [path.resolve(__dirname, '../node_modules')]
    },
    'module': {
        //preLoaders: [
            //{
                //test: /\.jsx?$/, 
                //exclude: /(node_modules|bower_components)/,
                //loader: 'eslint'
            //}
        //],
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'url',
                query: {
                    limit: 10000,
                    name: 'assets/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.css$/,
                exclude: /(node_modules|bower_components)/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            }
        ]
    },
    'plugins': [
        new ExtractTextPlugin('[name].[hash].css'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'config',
            chunks: ['config', 'app'],
            filename: 'config.js'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'utils',
            chunks: ['utils'],
            minChunks: Infinity,
            filename: 'static/utils.min.js'
        }),
        //new webpack.optimize.CommonsChunkPlugin({
            //name: 'math',
            //chunks: ['math', 'appgame', 'app'],
            //filename: 'static/math.min.js'
        //}),
        //new webpack.optimize.CommonsChunkPlugin({
            //name: 'game',
            //chunks: ['game', 'appgame', 'app'],
            //filename: 'static/game.min.js'
        //}),
        //new webpack.optimize.CommonsChunkPlugin({
            //name: 'render',
            //chunks: ['render', 'appgame', 'app'],
            //filename: 'static/render.min.js'
        //})
    ]
}
