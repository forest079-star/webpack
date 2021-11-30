const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Webpack = require('webpack');

const DEV_MODE = process.env.NODE_ENV === 'development';
console.log(`DEV_MODE:${DEV_MODE}`);

const CONTENT_HASH = DEV_MODE ? '' : '-[contenthash]';

module.exports = {
  context: path.resolve('src'), //context 指定所有的檔案都從 src 資料始開始
  mode: process.env.NODE_ENV, // mode 一定要加，只能是 development 或是 production 兩種. 他可以知道環境變數目前是哪個模式 會看 package.json 設定
  entry: { // 程式進入點
    app: ['./index.js'],
  },
  // https://webpack.js.org/configuration/devtool/
  devtool: DEV_MODE ? 'inline-source-map' : false, // production 發佈就拿掉 source-map
  output: {
    filename: `js/[name]${CONTENT_HASH}.js`, // 打包後的檔名
    chunkFilename: `js/[name]-chunk${CONTENT_HASH}.js`, //多程式進入點 [name] 會改為和上方一樣 app 名字 第三方掛件名稱 習慣性增加 chunk 名稱
    path: path.resolve('dist'), // 打包後的檔案路徑
    publicPath: '/',
  },
  resolve: {
    modules: [
      // 在 import 檔案, 如果不想寫完整的路徑
      // 可以加入這些目錄, 讓 webpack 自動尋找, 主要是讓圖片支援 ~img 路徑寫法
      path.resolve('src'),
      path.resolve('node_modules'),
    ],
     // 改為絕對路徑模式去找檔案
    alias: {
      '@': path.resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: { loader: 'babel-loader' },  // 當遇到 babel-loader 會去尋找 .babelrc 檔案
        include: [path.resolve('src')], // 只找這個資料夾下的檔案，可以加速 webpack 打包
        exclude: /node_modules/, // 排除文件，加速 webpack 打包
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, // start 把 css 存成實體.css檔案 而不是注入到 js 裡
            options: {
            },
          },
          {
            loader: 'css-loader',
            options: { sourceMap: true },
          },
          {
            loader: 'sass-loader',
            options: { 
              sourceMap: true,
              // 可以注入全域變數
              // additionalData: `  
              //   $DEV_MODE: ${DEV_MODE};
              //   @import '~css/mixins/_mixin.scss';
              // `,
            },
          },
        ],
        include: path.resolve('src/css'),
      },
      // 啟用 pug
      // {
      //   test: /\.pug$/,
      //   use: [
      //     { loader: 'html-loader' },
      //     {
      //       loader: 'pug-html-loader',
      //       options: {
      //         pretty: DEV_MODE,
      //         data: {
      //           DEV_MODE,
      //           // MY_DATA: 'milkmidi',
      //         },
      //       },
      //     },
      //   ],
      //   include: path.resolve('src/html'),
      // },
      {
        test: /\.html$/,
        use: [{
          // https://github.com/webpack-contrib/html-loader
          loader: 'html-loader',
        }, ],
        include: path.resolve('src/html'),
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 2048, // 小於 2048 bytes(2k) 的圖檔, 自動變成 base64 字串
              // 檔名： [資料夾][檔名].[副檔名]
              name: '[path][name].[ext]?[hash:10]',
              esModule: false,
            },
          },
        ],
        include: path.resolve('src/img'),
      },
    ],
  },
  plugins: [
    // start 多個 html 進入點
    new HtmlWebpackPlugin({
      template: './html/index.html', // 樣板
      filename: 'index.html', // 產出的樣板名稱
    }),
    // new HtmlWebpackPlugin({
    //   template: './html/about.pug',
    //   filename: 'about.html',
    //   chunks: ['vendors', 'about'], 這樣才會分別編譯出其他 js 進入點, 上方entry也要新增 about: ['./about.js'],
    // }),
     // 可以將CSS輸出實體.css 檔案 並自訂css檔案名稱
    new MiniCssExtractPlugin({
      filename: `css/[name]${CONTENT_HASH}.css`,
    }),
    // https://webpack.js.org/plugins/define-plugin/
    new Webpack.DefinePlugin({
      'process.env': {
        DEF_BOO: true,
        DEF_NUM: 9527,
        DEF_OBJ: JSON.stringify({
          obj: 'ryan'
        }),
        // DEF_STR: "hi webpack",//這樣會有問題
        DEF_STR: JSON.stringify("我是中文字"),
        WEB_URL: JSON.stringify(
          DEV_MODE ?
          'http://localhost' :
          'https://www.google.com'
        ),
      }
    }),
  ],
  devServer: {
    before(app, server) {
      const chokidar = require('chokidar');
      // hot reload for html, pug 監聽HTML檔案有更新就 reload
      chokidar.watch('src/html/**/*').on('all', () => {
        server.sockWrite(server.sockets, 'content-changed');
      });
    },
    // https://webpack.js.org/configuration/dev-server/#devserverhistoryapifallback
    // HTML5 History API
    historyApiFallback: true, // Vue Router 會用到的功能
    port: 3000,
    hot: true, // 支援 css hot reload
    // 可以用 ip 連線，預設是 localhost
    host: '0.0.0.0',
    stats: 'minimal',
  },
   // start 把其他libary 拆成獨立的 JS (verdors)
  optimization: {
    // https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          // https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroupscachegroupenforce
          enforce: true,
        },
      },
    },
  },
};
