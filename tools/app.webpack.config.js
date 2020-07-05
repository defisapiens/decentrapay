const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const config = require('config')
const fs = require('fs')
const mkdirp = require('mkdirp')

const clientConfigPath = path.resolve(__dirname, '../static/client.json')

console.log("Generating client config")
mkdirp.sync('./static')
fs.writeFileSync(clientConfigPath, JSON.stringify(config.public))

module.exports = (env = {prod: process.env['NODE_ENV'] == 'production'}) => {
  const __DEV__ = !env.prod
  const externals = nodeExternals()
  const webConfig = {
    entry: [
      './src/web/index.js'
    ],
    target: 'web',
    output: {
      filename: __DEV__ ? '[name].js' : '[name].[contenthash].js',
      path: path.resolve('./static'),
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        }
      ],
    },
    resolve: {
      alias: {
        config: clientConfigPath
      },
    },
    devtool: env.prod ? '' : 'eval',
    optimization: env.prod ? {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all"
          }
        }
      }
    } : {} ,
    plugins: [
      new MiniCssExtractPlugin({
        filename: __DEV__ ? '[name].css' : '[name].[hash].css',
        chunkFilename: __DEV__ ? '[id].css' : '[id].[hash].css',
      }),
      new HtmlWebpackPlugin({
        title:'Daipay',      
        inject: false,
        template: require('html-webpack-template'),
        filename: 'index.html',
        inject: 'body',
        meta: [
          {name:'description',content:'Daipay'},
          {name:'viewport',content:'width=device-width, initial-scale=1.0'},
        ],
        links: [
          {rel:'icon',type:'image/png',href:'/icons/favicon.png?v=2'},
          {rel:'apple-touch-icon',sizes:'180x180',href:'/icons/apple-touch-icon.png'},
          {rel:'stylesheet',href:'https://use.fontawesome.com/releases/v5.5.0/css/all.css',integrity:'sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU',crossorigin:'anonymous'}
        ],
        scripts: [
        ],
        bodyHtmlSnippet: '<div id="app"/>'
      }),
      new webpack.DefinePlugin({
        __DEV__
      })
    ],
  }
  const serverConfig = {
    target: 'node',
    entry: [
      './src/server/index.js'
    ],
    output: {
      filename: './server.js',
      path: path.resolve('./dist'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          /*
          options: {
            presets: ['@babel/env']
          }
          */
        },
        {
          test: /\.handlebars/,
          loaders: ['raw-loader']
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: __DEV__ ? '[name].css' : '[name].[hash].css',
        chunkFilename: __DEV__ ? '[id].css' : '[id].[hash].css',
      }),
      new webpack.DefinePlugin({
        __DEV__: !env.prod,
        __TEST__: false
      })
    ],
    externals: nodeExternals({whitelist: ['webpack-hot-client']}),
  }
  return [webConfig, serverConfig]
}
