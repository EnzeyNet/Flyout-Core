const webpack = require('webpack');
const path = require('path');

const PATHS = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist')
};

module.exports = {
  // Entry accepts a path or an object of entries. We'll be using the
  // latter form given it's convenient with more complex configurations.
  entry: {
    app: ['babel-polyfill', PATHS.src + '/flyout.js']
  },
  output: {
    path: PATHS.dist,
    filename: '[name].js'
  },
  plugins: [
	new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ],
  module: {
	loaders: [
		{
			loader: 'babel', // 'babel-loader' is also a legal name to reference
			test: /\.js$/,
			exclude: /node_modules/,
			include: [
			  PATHS.src
			],
			cacheDirectory: true,
			query: {
				presets: [
					"es2015",
					"stage-0"
				],
				plugins: [
					["transform-async-to-module-method", {
						"module": "co",
						"method": "wrap"
					}]
				]
			}
		}
	]
  }
};