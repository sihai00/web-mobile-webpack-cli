const webpack = require('webpack')
const config = require('./config')
const {resolve} = require('path')

module.exports = {
	devtool: 'source-map',
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					{loader: 'style-loader', options: { sourceMap: true }},
					{loader: 'css-loader', options: { sourceMap: true }},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							ident: 'postcss',
							plugins: [
								require('autoprefixer')(),
							]
						}
					},
					{loader: 'sass-loader', options: { sourceMap: true }},
				]
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': 'development'
		})
	],
	devServer: {
		contentBase: resolve(__dirname, `../${config.outputPath}`),
		port: config.port,
		index: config.serverIndex,
	}
}
