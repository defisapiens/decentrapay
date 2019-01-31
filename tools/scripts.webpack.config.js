const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = _ => ({
  target: 'node',
  entry: [
    './src/scripts/wallets.js'
  ],
  output: {
    filename: './wallets.js',
    path: path.resolve('./dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      }
    ],
  },
  externals: nodeExternals(),
})

