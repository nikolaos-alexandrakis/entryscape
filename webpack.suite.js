// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const merge = require('webpack-merge');
const path = require('path');
const commonConfig = require('./webpack.config.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const STATIC_URL = 'https://static.entryscape.com';
const APP = 'suite';
const VERSION = require('./package.json').version;

const getAlias = (name, type = 'module', noSource = false) => path.resolve(path.join(__dirname, 'src', type, name, !noSource ? 'src' : ''));

const context = path.join(__dirname, 'src', 'app', 'suite');
const configPath = path.resolve(path.join(getAlias('suite', 'app'), 'config', 'config'));
const themePath = path.resolve(path.join(getAlias('suite', 'app'), '..', '..',
  'theme'));
const locales = ['de', 'sv', 'nb']; // TODO: @scazan Sachsen supports nb but no other. Ask @matthias
const momentLocaleRegExp = RegExp(locales.reduce((accum, locale, i) => (i === 0 ? `${accum}${locale}` : `${accum}|${locale}`), ''));

module.exports = (env, argv) => {
  let config = merge(commonConfig(env, argv), {
    context,
    entry: {
      suite: 'src/index.js',
    },
    output: {
      path: path.join(__dirname, 'src/app/suite/dist'),
      publicPath: `${STATIC_URL}/${APP}/${VERSION}/`,
      filename: '[name].all.js',
      chunkFilename: '[name].bundle.js',
      library: 'entryscape',
    },
    resolve: {
      alias: {
        config: configPath,
        theme: themePath,
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
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          }],
        },
      ],
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
      new CleanWebpackPlugin([
        path.join(__dirname, 'src/app/suite/dist'),
      ]),
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, momentLocaleRegExp),
      new CopyWebpackPlugin([
        {
          from: path.resolve(path.join(__dirname, 'src', 'app', 'suite', 'assets')),
          to: 'assets', // dist/templates/skos/skos.json
        },
      ]),
    ],
    stats: {
      warnings: false,
    },
  });

  if (argv.mode === 'development') {
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

    config = merge(config, {
      devtool: '#inline-source-map',
      output: {
        publicPath: '/',
      },
      devServer: {
        hot: true,
        contentBase: path.resolve(getAlias('suite', 'app', true)),
        historyApiFallback: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
      plugins: [
        // new BundleAnalyzerPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
          template: path.resolve(path.join(getAlias('suite', 'app', true), 'index.dev.html')),
        }),
        new CircularDependencyPlugin({
          // exclude detection of files based on a RegExp
          exclude: /a\.js|node_modules/,
          // add errors to webpack instead of warnings
          failOnError: false,
          // allow import cycles that include an asyncronous import,
          // e.g. via import(/* webpackMode: "weak" */ './file.js')
          allowAsyncCycles: false,
          // set the current working directory for displaying module paths
          cwd: process.cwd(),
        }),
      ],
    });
  }

  return config;
};
