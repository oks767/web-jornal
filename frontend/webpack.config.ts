import HTMLWebpackPlugin from "html-webpack-plugin"
import path from 'path'
import webpack from 'webpack'

const config: webpack.Configuration = {
    mode: 'development',
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    output: {
        filename: "[name].[contenthash].js",
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'public', 'index.html')
        }),
        new webpack.ProgressPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
            test: /\.css$/i,
            use: [
                'style-loader',
                'css-loader',
                'postcss-loader'
            ],
        }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
}

export default config;