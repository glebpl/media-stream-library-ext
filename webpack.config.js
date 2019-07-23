'use strict';

const fs = require('fs');
const webpack = require('webpack');
const path = require('path');

const base = fs.realpathSync(process.cwd());
const resolveBase = relativePath => path.resolve(base, relativePath);
const mode = 'development';

module.exports = {
    mode: mode
    , devtool: 'source-map'
    , entry: resolveBase('src/index.ts')
    , stats: 'minimal'
    , output: {
        // after build is made it will be copied to dist by grunt
        path: resolveBase('dist')
        , filename: 'media-stream-library-ext.js'
        , library: 'mediaStreamLibraryExt'
        , libraryTarget: 'umd'
    }
    , resolve: {
        extensions: ['.ts', '.js']
        // The debug packages resolves to src/debug.js by default
        // which doesn't work on IE11 (it's not ES5), but it seems
        // that the dist/debug.js file does work.
        /*alias: {
            debug: 'debug/dist/debug.js',
        },*/
    }
    , module: {
        rules: [
            {
                test: /\.ts$/
                , use: {
                    loader: 'babel-loader'
                    , options: {
                        sourceType: 'unambiguous'
                        , presets: [
                            [
                                '@babel/env'
                                , { useBuiltIns: 'usage', corejs: 3 }
                            ]
                            , '@babel/typescript'
                        ]
                        , plugins: [
                            '@babel/plugin-proposal-export-namespace-from'
                            , '@babel/proposal-class-properties'
                            // '@babel/proposal-object-rest-spread',
                        ]
                        , babelrc: false
                    }
                }
            }
        ]
    }
    , plugins: [new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode)
        // , 'process.env.VERSION': JSON.stringify(version)
    })]
};
