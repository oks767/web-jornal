const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
//   дополнительные плагины
   plugins: [
    new HtmlWebpackPlugin({
      title: 'Output Management',
    }),
  ],
// дополнительные модули
  module: {
    rules: [
        // загрузка css файлов в один
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    //   загрузка\сборка картинок в нужную папку
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
};