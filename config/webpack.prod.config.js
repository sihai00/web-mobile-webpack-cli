const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const webpack = require('webpack')
const {resolve} = require('path')

module.exports = {
	devtool: false,
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.scss$/,
				include: [
					resolve("src"),
				],
				use: [
					{loader: MiniCssExtractPlugin.loader},
					{loader: 'css-loader'},
					{
						loader: 'postcss-loader',
						options: {
							ident: 'postcss',
							plugins: [
								require('autoprefixer')(),
							]
						}
					},
					{loader: 'sass-loader'},
				]
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': 'production'
		}),
		new MiniCssExtractPlugin({
			filename: chunkData => chunkData.chunk.name.includes('/') ? '[name].[contenthash:8].css': 'css/[name].[contenthash:8].css',
			chunkFilename: "css/[name].[contenthash:8].css",
		})
	],
	optimization: {
		minimizer: [
			new TerserJSPlugin({
				parallel: true,
				cache: true,
			}),
			new OptimizeCSSAssetsPlugin({})
		],
		runtimeChunk: {
			name: 'manifest'
		},
		moduleIds: 'hashed',
		splitChunks: {
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					chunks: 'all',
					name: 'vendors',
					filename: 'js/vendors.[contenthash:8].js',
					priority: 2,
					reuseExistingChunk: true
				},
				common: {
					test: /\.m?js$/,
					chunks: 'all',
					name: 'common',
					filename: 'js/common.[contenthash:8].js',
					minSize: 0,
					minChunks: 2,
					priority: 1,
					reuseExistingChunk: true
				}
			}
		}
	},
}
