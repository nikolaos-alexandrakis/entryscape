const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const DojoWebpackPlugin = require('dojo-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const getAlias = (name, type = 'module') => path.resolve(path.join(__dirname, 'src', type, name, 'src'));

module.exports = (env, argv) => {
  let config = {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
      new DojoWebpackPlugin({
        loaderConfig: require('./config/dojoConfig'),
        locales: ['en'],
        environment: {dojoRoot: '/'}, // used at run time for non-packed resources (e.g.
        // blank.gif)
        buildEnvironment: {dojoRoot: '../../../node_modules'}, // used at build time
        noConsole: true,
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        jquery: 'jquery',
        // 'window.jquery': 'jquery',
        Popper: ['popper.js', 'default'],
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
      new CopyWebpackPlugin([
        {
          from: path.resolve(path.join(__dirname, 'src', 'templates')),
          to: 'templates', // dist/templates/skos/skos.json
          test: /\.json$/,
          flatten: true,
        },
        {
          from: path.join(getAlias('commons'), 'theme'),
          to: 'theme',
        },
      ]),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(rdfjson|rdforms|esi18n|store|)\/).*/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                'lodash',
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-syntax-dynamic-import',
                ['@babel/plugin-transform-modules-commonjs', {strictMode: false}],
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.html$/,
          use: ['raw-loader'],
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: [
            'file-loader',
            {
              loader: 'image-webpack-loader',
              options: {
                bypassOnDebug: true, // webpack@1.x
                disable: true, // webpack@2.x and newer
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
              publicPath: '/fonts', // relative to HTML page (samples)
            },
          }],
        },
      ],
    },
    resolve: {
      alias: {
        jquery: path.resolve(path.join(__dirname, 'node_modules', 'jquery')),
        commons: getAlias('commons'),
        catalog: getAlias('catalog'),
        admin: getAlias('admin'),
        terms: getAlias('terms'),
        workbench: getAlias('workbench'),
        suite: getAlias('suite', 'app'),
        registry: getAlias('registry', 'app'),
        blocks: getAlias('blocks', 'app'),
        spa: getAlias('spa', 'lib'),
        templates: path.resolve(path.join(__dirname, 'node_modules', 'rdforms-templates', 'src', 'templates')),
      },
    },
  };

  if (argv.mode === 'production') {
    config = merge(config, {
      optimization: {
        minimize: true,
      },
    });
  }

  return config;
};
