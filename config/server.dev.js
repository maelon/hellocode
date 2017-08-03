'use strict'

const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

const config = require('./webpack.dev.config.js');

const compiler = webpack(config);
const server = new webpackDevServer(compiler, {
    contentBase: path.resolve(__dirname, '../src/'),
    noInfo: true,
    hot: true,
    publicPath: ''
});
server.listen(8000, 'localhost', (error, result) => {
    if(error) {
        console.log('Error', error);
    } else {
        console.log('listening at port: 8000 by localhost');
    }
});
