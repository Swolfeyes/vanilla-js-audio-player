
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/main.js',

  output: {
    filename: 'bundle.js',
    publicPath: '/',
    path: path.join(__dirname, 'dist'),
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
        include: path.join(__dirname, 'src'),
        exclude: path.resolve(__dirname, 'node_modules'),
        use: [
          { loader: 'babel-loader' },
        ]
      },
      {
        test: /\.svg?$/,
        use: [
          { loader: 'file-loader'},
        ]
      },
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'sass-loader'
        }]
      }
    ]
  },

  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],

  devtool: 'eval',

  devServer: {
    hot: true,
    open: true,
    publicPath: '/',
    inline: true,
    overlay: true,
    port: 9000,
    stats: {
      modules: false,
      colors: true,
      env: false,
      publicPath: true,
      timings: true,
      version: true,
      errors: true,
    },
  },

};