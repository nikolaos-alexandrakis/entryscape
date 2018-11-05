const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path');
const commonConfig = require('./webpack.config.js');

const getAlias = (name, type = 'module') => path.resolve(path.join(__dirname, 'src', type, name, 'src'));

const context = path.join(__dirname, 'src', 'app', 'registry');
const configPath = path.resolve(path.join(getAlias('registry', 'app'), 'config', 'config'));

const locales = ['de', 'sv', 'nb']; // TODO: @scazan Sachsen supports nb but no other. Ask @matthias
const momentLocaleRegExp = RegExp(locales.reduce((accum, locale, i) => (i === 0 ? `${accum}${locale}` : `${accum}|${locale}`), ''));

module.exports = (env, argv) => {
  let config = merge(commonConfig(env, argv), {
    context,
    entry: {
      registry: 'src/index.js',
    },
    output: {
      path: path.join(__dirname, 'src/app/registry/dist'),
      filename: '[name].all.js',
      chunkFilename: '[name].bundle.js',
    },
    resolve: {
      alias: {
        config: configPath,
      },
    },
    module: {
      rules: [
        {
          test: /\.nls$/,
          use: [
            {
              loader: 'nls-loader',
              options: {
                context,
                locales,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin([
        path.join(__dirname, 'src/app/registry/dist'),
      ]),
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, momentLocaleRegExp),
    ],
    optimization: {
      // splitChunks: {
      // chunks: 'all',
      // }
    },
  });

  if (argv.mode === 'development') {
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

    config = merge(config, {
      devtool: '#inline-source-map',
      // devtool: 'hidden-source-map',
      devServer: {
        hot: true,
        port: 8080,
        contentBase: path.resolve(getAlias('registry', 'app')),
        historyApiFallback: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
      plugins: [
        // new BundleAnalyzerPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
          template: path.resolve(path.join(getAlias('registry', 'app'), '..', 'index.dev.html')),
        }),
      ],
    });
  }

  return config;
};
