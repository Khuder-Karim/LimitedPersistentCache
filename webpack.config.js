let webpack = require('webpack');
let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
let path = require('path');
let env = require('yargs').argv.mode;

let plugins = [],
    outputFile = "bundle";

if (env === 'build') {
    plugins.push(new UglifyJsPlugin({ minimize: true }));
    outputFile = outputFile + '.min.js';
} else {
    outputFile = outputFile + '.js';
}

let config = {
  entry: path.resolve(__dirname ,'src/index.js'),
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'bundle'),
    filename: outputFile,
  },
    externals: {
        "LimitedPersistentCache" : "LimitedPersistentCache"
    },
    module: {
    rules: [
        {
            test: /(\.jsx|\.js)$/,
            loader: 'babel-loader',
            include: [path.resolve(__dirname, 'src')],
            exclude: [path.resolve(__dirname, 'node_modules')],
            options: {
                presets: ['es2015', 'react']
            }
        },
        {
            test: /(\.jsx|\.js)$/,
            enforce: 'pre',
            exclude: [path.resolve(__dirname, 'node_modules')],
            use: [
                {
                    loader: 'eslint-loader',
                    options: {
                        failOnWarning: false,
                        failOnError: false
                    }
                }
            ]
        },
        {
            test: /(\.scss|\.sass)$/,
            use: [
                'style-loader',
                'css-loader',
                'sass-loader'
            ]
        }
    ]
  },
    resolve: {
        modules: [path.resolve('./node_modules'), path.resolve('./src'), path.resolve('./lib')],
        extensions: ['.json', '.js']
    },
    plugins: plugins
};

module.exports = config;
