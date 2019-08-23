const webpack = require('webpack');
const path = require('path');
const DojoWebpackPlugin = require('dojo-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const createVariants = require('parallel-webpack').createVariants;

/** ********** INIT *********** */
// Get the version from the package.json. If on a snapshot version then use the 'latest' version
// to keep consistency between local.js entryscape.version and generated publicPath of the webpack
let VERSION = require('./package.json').version;
VERSION = VERSION.endsWith('-SNAPSHOT') ? 'latest' : VERSION;

const STATIC_URL = `https://static.${VERSION !== 'latest' ? 'cdn.' : ''}entryscape.com`;

const getAlias = (name, type = 'module', noSource = false) =>
  path.resolve(path.join(__dirname, 'src', type, name, !noSource ? 'src' : ''));
const locales = ['de', 'sv', 'nb']; // TODO: @scazan Sachsen supports nb but no other. Ask @matthias
const momentLocaleRegExp = RegExp(locales.reduce((accum, locale, i) => (i === 0 ? `${accum}${locale}` : `${accum}|${locale}`), ''));

/** ********** CONFIGURATION *********** */

// Those options will be mixed into every variant
// and passed to the `createConfig` callback.
const baseOptions = {
  // preferredDevTool: process.env.DEVTOOL || 'eval'
};

// This object defines the potential option variants
// the key of the object is used as the option name, its value must be an array
// which contains all potential values of your build.
const variants = {
  app: ['suite', 'registry'],
  debug: [true, false],
};

function createConfig(options) {
  const APP_PATH = path.resolve(path.join(__dirname, 'src', 'app', options.app));
  const PUBLIC_PATH = `/${options.app}/${VERSION}/`;
  const showNLSWarnings = false;
  const optimization = {};

  if (options.debug) {
    optimization.minimizer = [new TerserPlugin()];
  }

  return {
    mode: options.debug ? 'development' : 'production',
    devtool: options.debug ? 'inline-cheap-module-source-map' : '',
    entry: `./src/app/${options.app}/src/index.js`,
    output: {
      filename: options.debug ? 'app.debug.js' : 'app.js',
      chunkFilename: '[name].js',
      path: path.join(__dirname, 'src', 'app', options.app, 'dist'),
      library: '[name]',
    },
    plugins: [
      new DojoWebpackPlugin({
        loaderConfig: require('./dojo/config'),
        locales: ['en'],
        environment: { dojoRoot: `${STATIC_URL}/libs` }, // used at run time for non-packed resources (e.g.
        // blank.gif)
        buildEnvironment: { dojoRoot: './node_modules' }, // used at build time
        noConsole: true,
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        jquery: 'jquery',
        // 'window.jquery': 'jquery',
        Popper: ['popper.js', 'default'],
        m: 'mithril',
      }),
      new CopyWebpackPlugin([
        {
          from: path.resolve(path.join(__dirname, 'src', 'templates')),
          to: 'templates', // dist/templates/skos/skos.json
          test: /\.json$/,
          flatten: true,
        },
        {
          from: path.resolve(path.join(__dirname, 'src', 'app', options.app, 'assets')),
          to: 'assets', // dist/assets
        },
      ]),
      new CleanWebpackPlugin([
        path.join(__dirname, 'src', 'app', options.app, 'dist'),
      ]),
      new HtmlWebpackPlugin({ // Also generate a test.html
        filename: 'index.html',
        template: path.resolve(path.join(__dirname, 'src', 'app', 'suite', 'index.hbs')),
        inject: false,
        identifier: VERSION,
        source: `${STATIC_URL}${PUBLIC_PATH}index.html`, // @todo @valentino
      }),
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, momentLocaleRegExp),
    ],
    stats: {
      warnings: false,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(bootstrap|bootstrap-material-design|rdfjson|rdforms|esi18n|entrystore-js|)\/).*/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [[
                  '@babel/preset-env', {
                    targets: {
                      ie: 11,
                    },
                  },
                ]],
                plugins: [
                  'lodash',
                  '@babel/plugin-proposal-object-rest-spread',
                  '@babel/plugin-proposal-class-properties',
                  '@babel/plugin-syntax-dynamic-import',
                  ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
                  ['@babel/plugin-transform-react-jsx', { pragma: 'm' }],
                ],
              },
            },
            {
              loader: 'ifdef-loader',
              options: {
                BLOCKS: options.app === 'blocks',
              },
            },
          ],
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
          test: /\.(s*)css$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
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
          test: /.+flag-icon-css.+\.svg$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[folder][name].[ext]',
              outputPath: 'flags/',
            },
          }],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          exclude: /.+flag-icon-css.+\.svg$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          }],
        },
        {
          test: /\.hbs$/,
          loader: 'handlebars-loader',
        },
      ],
    },
    resolve: {
      mainFiles: ['index'],
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
    optimization,

  };
}

module.exports = createVariants(baseOptions, variants, createConfig);
