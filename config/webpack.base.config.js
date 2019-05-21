const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpackMerge = require('webpack-merge')
const glob = require('glob')
const {resolve} = require('path')
const productionConfig = require('./webpack.prod.config')
const developmentConfig = require('./webpack.dev.config')
const config = require('./config')
const webpack = require('webpack')

const baseConfig = {
	entry: glob.sync(resolve(__dirname, '../src/**/js/**/*.js')).filter(v => !v.includes('common')).reduce((pre, filepath) => {
		const tempList = filepath.split('src/')[1].split(/js\//)
		const filename = `${tempList[0]}${tempList[1].replace(/\.js/g, '')}`

		return Object.assign(pre, {[filename]: filepath})
	}, {}),
	output: {
		publicPath: config.publicPath,
		path: resolve(__dirname, `../${config.outputPath}`),
		chunkFilename: 'js/[name].[contenthash:8].js',
		filename: chunkData => chunkData.chunk.name.includes('/') ? '[name].[contenthash:8].js': 'js/[name].[contenthash:8].js'
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, '../src'),
		},
		modules: [
			resolve('src'),
			resolve('node_modules'),
		]
	},
	target: 'web',
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				include: [
					resolve("src"),
				],
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-transform-runtime']
					}
				}
			},
			{
				test: /\.css$/,
				include: [
					resolve("src"),
				],
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(png|jpg|jpeg|gif)$/,
				include: [
					resolve("src"),
				],
				use: [
					{
						loader: 'url-loader',
						options: {
							name: 'assets/[name].[ext]',
							limit: 1000,
							// outputPath: config.publicPath
						}
					}
				]
			},
			{
				test: /\.(eot|ttf|svg|woff)$/,
				include: [
					resolve("src"),
				],
				use: [
					{loader:'file-loader'},
				]
			},
			{
				test: /\.html$/,
				include: [
					resolve("src"),
				],
				use: [
					{
						loader: 'html-loader',
						options: {
							attrs: ['img:src', 'img:data-src', ':data-background']
						}
					}
				]
			},
			{
				test: /\.ejs$/,
				include: [
					resolve("src"),
				],
				use: [
					{
						loader: 'html-loader',
						options: {
							attrs: ['img:src', 'img:data-src', ':data-background']
						}
					},
					{
						loader: 'ejs-html-loader',
						options: {
							title: config.title,
							publicPath: config.publicPath
						}
					}
				]
			},
			{
				test: require.resolve('zepto'),
				use: 'imports-loader?this=>window'
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(),
		...glob.sync(resolve(__dirname, '../src/**/html/*.ejs')).filter(v => !v.includes('common')).map((filepath, i) => {
			const tempList = filepath.split('src/')[1].split(/html\//)

			const fileName = tempList[1].split('.')[0].split(/[\/|\/\/|\\|\\\\]/g).pop()
			const fileChunk = `${tempList[0]}${fileName}`
			// const chunks = `${tempList[0] ? fileChunk : `js/${fileChunk}`}`

			return new HtmlWebpackPlugin({
				filename: `${fileChunk}.html`,
				template: filepath,
				chunks: ['vendors', 'common', fileChunk, 'manifest'],
				minify: process.env.ENV === 'production' ? {
					removeComments: true,
					collapseWhitespace: true,
					minifyCSS: true
				} : false
			})
		}),
		new CopyWebpackPlugin([
			{ from: resolve(__dirname, `../src/common/lib`), to: resolve(__dirname, `../${config.outputPath}/lib`)}
		]),
		new webpack.ProvidePlugin({
			$: 'zepto'
		})
	]
}

module.exports = env => {
	let config = env === 'production' ? productionConfig : developmentConfig
	return webpackMerge(baseConfig, config)
}
