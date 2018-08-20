const path = require('path');

module.exports = {
  entry: { main: './app/App.jsx' },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'neuvontajono.js'
  },
  module: {
    rules: [{
      test: /\.js(x?)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  performance: {
    maxEntrypointSize: 1024000,
    maxAssetSize: 1024000
  }
};
