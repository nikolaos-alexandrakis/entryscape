const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const DojoWebpackPlugin = require('dojo-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

/** ********** INIT *********** */
const VERSION = require('./package.json').version;

const STATIC_URL = 'https://static.entryscape.com';

const getAlias = (name, type = 'module', noSource = false) =>
  path.resolve(path.join(__dirname, 'src', type, name, !noSource ? 'src' : ''));
const locales = ['de', 'sv', 'nb']; // TODO: @scazan Sachsen supports nb but no other. Ask @matthias
const momentLocaleRegExp = RegExp(locales.reduce((accum, locale, i) => (i === 0 ? `${accum}${locale}` : `${accum}|${locale}`), ''));

/** ********** CONFIGURATION *********** */
module.exports = (env, argv) => {
  if (argv && !argv.app) {
    throw Error('Please provide an `--app` argument to the configuration');
  }

  const APP = (argv && argv.app) || 'suite'; // needed for eslint to read the config
  const APP_PATH = path.resolve(path.join(__dirname, 'src', 'app', APP));
  const showNLSWarnings = (argv && argv['nls-warnings']) || false;

  let config = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: 'src/index.js',
    output: {
      path: path.join(__dirname, 'src', 'app', APP, 'dist'),
      publicPath: `${STATIC_URL}/${APP}/${VERSION}/`,
      filename: 'app.js',
      library: APP,
    },
    context: APP_PATH,
    plugins: [
      new DojoWebpackPlugin({
        loaderConfig: require('./config/dojoConfig'),
        locales: ['en'],
        environment: { dojoRoot: '/' }, // used at run time for non-packed resources (e.g.
        // blank.gif)
        buildEnvironment: { dojoRoot: '../../../node_modules' }, // used at build time
        noConsole: true,
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        jquery: 'jquery',
        // 'window.jquery': 'jquery',
        Popper: ['popper.js', 'default'],
      }),
      new CopyWebpackPlugin([
        {
          from: path.resolve(path.join(__dirname, 'src', 'templates')),
          to: 'templates', // dist/templates/skos/skos.json
          test: /\.json$/,
          flatten: true,
        },
        {
          from: path.resolve(path.join(__dirname, 'src', 'app', APP, 'assets')),
          to: 'assets', // dist/assets
        },
        Object.assign({}, (APP !== 'blocks' ? {
          from: path.resolve(path.join(__dirname, 'src', 'app', APP, 'index.html')),
          to: 'index.html', // dist/index.html
        } : { from: 'README.md', to: '' })), // TODO the README was added as a temp solution for blocks
      ]),
      new CleanWebpackPlugin([
        path.join(__dirname, 'src', 'app', APP, 'dist'),
      ]),
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, momentLocaleRegExp),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(rdfjson|rdforms|esi18n|entrystore-js|)\/).*/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                'lodash',
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-syntax-dynamic-import',
                ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
              ],
            },
          },
        },
        {
          test: /\.nls$/,
          use: [
            {
              loader: 'nls-loader',
              options: {
                context: APP_PATH,
                showNLSWarnings,
                locales,
              },
            },
          ],
        },
        {
          test:/\.(s*)css$/,
          use:['style-loader','css-loader', 'sass-loader']
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader',
            'less-loader',
          ],
        },
        {
          test: /\.html$/,
          use: ['raw-loader'],
        },
        {
          test: /\.(gif|png|jpe?g)$/i,
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
          test: /.+font-icon-css.+\.svg$/,
          loader: 'svg-url-loader'
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
        store: path.resolve(path.join(__dirname, 'node_modules', 'entrystore-js')),
        templates: path.resolve(path.join(__dirname, 'src', 'templates')),
        config: path.join(APP_PATH, 'src', 'config', 'config'),
        theme: path.join(APP_PATH, 'theme'),
      },
    },
    stats: {
      warnings: false,
    },
  };

  if (argv && argv.mode) {
    if (argv.mode === 'development') {
      config = merge(config, {
        devtool: '#inline-source-map',
        output: {
          publicPath: '/',
        },
        devServer: {
          hot: true,
          contentBase: APP_PATH,
          historyApiFallback: APP === 'blocks' ? false : true,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          watchOptions: {
            ignored: /node_modules/,
          },
        },
        plugins: [
          new webpack.HotModuleReplacementPlugin(),
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

      if (APP !== 'blocks') {
        config.plugins.push(
          new HtmlWebpackPlugin({
            template: path.join(
              getAlias(APP, 'app', true), 'index.dev.html'),
          })
        );
      }
    } else if (argv.mode === 'production') {
      config = merge(config, {
        optimization: {
          minimizer: [new UglifyJsPlugin()],
        },
      });
    }
  }

  return config;
};
