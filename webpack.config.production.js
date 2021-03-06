import path from "path";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";
import merge from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import baseConfig from "./webpack.config.base";

const config = merge(baseConfig, {
  devtool: "cheap-module-source-map",
  mode: "production",
  entry: {
    app: ["@babel/polyfill", "./app/index"]
  },

  output: {
    path: path.join(__dirname, "app/dist"),
    publicPath: "../dist/"
  },

  module: {
    rules: [
      {
        test: /\.less$/,
        use: [ {
          loader: MiniCssExtractPlugin.loader
        }, {
          loader: "css-loader",
          options: {
            sourceMap: true,
            modules: true,
            importLoaders: 1,
            localIdentName: "[local]"
          }
        }, {
          loader: "less-loader",
          options: {
            sourceMap: true,
            noIeCompat: true,
            strictMath: true
          }
        } ]
      },

      {
        test: [ /\.woff(\?v=\d+\.\d+\.\d+)?$/, /\.woff2(\?v=\d+\.\d+\.\d+)?$/ ],
        use: [ {
          loader: "url-loader",
          options: { limit: 10000, mimetype: "application/font-woff" }
        } ]
      },

      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [ {
          loader: "url-loader",
          options: { limit: 10000, mimetype: "application/octet-stream" }
        } ]
      },

      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [ { loader: "file-loader" } ]
      },

      {
        test: /\.gif(\?v=\d+\.\d+\.\d+)?$/,
        use: [ { loader: "file-loader" } ]
      },

      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [ {
          loader: "url-loader",
          options: { limit: 10000, mimetype: "image/svg+xml" }
        } ]
      },

      {
        test: /\.(mp4)$/,
        use: [ {
          loader: "file-loader",
          options: { mimetype: "video/mp4", publicPath: "./dist/", }
        } ]
      },
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            reserved: [
              "Buffer",
              "BigInteger",
              "Point",
              "ECPubKey",
              "ECKey",
              "ECSignature",
              "sha512_asm",
              "asm",
              "ECPair",
              "HDNode",
              "BridgeTransport"
            ]
          }
        }
      })
    ]
  },
  plugins: [

    new webpack.optimize.OccurrenceOrderPlugin(),

    new MiniCssExtractPlugin({ filename: "style.css" }),

    new HtmlWebpackPlugin({
      filename: "../app.html",
      template: "app/app.html",
      inject: false
    })
  ],
  target: "electron-renderer"
});

export default config;
