const path = require('path')
const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const { InjectManifest } = require('workbox-webpack-plugin')
// const WebpackObfuscator = require('webpack-obfuscator')

const prod = {
  mode: 'production',
  stats: 'errors-warnings',
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          filename: '[name].bundle.js'
        }
      }
    }
  }
}

module.exports = merge(common, prod)
