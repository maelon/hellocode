'use strict'

const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    'entry': {
        //'react': ['react', 'react-dom'],
        //'vendor': [ 
            //path.resolve(__dirname, '../src/libs/jpslib.js'),
            //path.resolve(__dirname, '../src/libs/jUtils.js')
        //],
        //'home': [ path.resolve(__dirname, '../src/pages/home/index.jsx') ],
        //'category': [ path.resolve(__dirname, '../src/pages/category/index.jsx') ]
        'gamecore': [ path.resolve(__dirname, '../src/gamecore/gamecore.js') ],
        'test': [ path.resolve(__dirname, '../test/gamecore_test.js') ],
        'cube': [ path.resolve(__dirname, '../test/drawCube.js') ]
    },
    'output': {
        'path': path.resolve(__dirname, '../dist'),
        'filename': '[name].[chunkhash].js',
        'sourceMapFilename': '[name].[chunkhash].js.map'
    },
    'devtool': 'source-map',
    'resolve': {
        'alias': {
            'gamecore': path.resolve(__dirname, '../src/gamecore')
        },
		'extensions': ['', '.js']
	},
    'externals': {
        //'jpslib': 'jpslib',
        //'jutils': 'jUtils'
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
                loader: 'style!css'
            }
        ]
    },
    'plugins': [
        //new webpack.DefinePlugin({
            //'process.env': {
                //'NODE_ENV': JSON.stringify('production')
            //}
        //}),
        //new webpack.optimize.CommonsChunkPlugin({
            //name: 'react',
            //chunks: ['react'],
            //filename: 'react.min.js'
        //}),
        //new webpack.optimize.CommonsChunkPlugin({
            //name: 'vendor',
            //chunks: ['vendor'],
            //filename: 'vendor.min.js'
        //})
        new htmlWebpackPlugin({
            'chunks': ['test', 'cube'],
            'filename': 'test.html',
            'template': path.resolve(__dirname, '../test/test.html'),
            'inject': true
        })
    ]
}
