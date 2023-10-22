const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const dotenv = require("dotenv").config({ path: __dirname + "/local.env" });
const webpack = require("webpack");
const package = require("./package.json");

const USE_TILES = process.env.USE_TILES === "true" || (process.env.USE_TILES === undefined && dotenv.parsed.USE_TILES === "true");

const copyAssembledData =
  !USE_TILES ? [{ from: "build/assembled.json" }] : [];

module.exports = {
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jp(e*)g|svg|sdf)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "images/[hash]-[name].[ext]",
            },
          },
        ],
      },
      {
        test: /\.sql$/,
        use: "raw-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./index.html",
      filename: "./index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new webpack.DefinePlugin({
      MAPBOX_KEY: `"${dotenv.parsed.MAPBOX_KEY}"`,
      BASE_URL: `"${dotenv.parsed.BASE_URL}"`,
      VERSION: `"${package.version}"`,
      BUILD_DATE: `${Date.now()}`,
      USE_TILES: `${USE_TILES}`,
      DEBUG: `${process.env.NODE_ENV === "development"}`
    }),
    new CopyPlugin({
      patterns: [
        { from: "CNAME" },
        { from: "data", to: "data" },
        { from: "icons/**/*.svg" },
        { from: require.resolve("sql.js/dist/sql-wasm.wasm") },
        { from: "shortcuts" },
        { from: "build/search.json" },
        ...copyAssembledData,
      ],
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],
};
