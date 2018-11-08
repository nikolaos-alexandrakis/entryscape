const path = require('path');

module.exports = {
  extends: 'airbnb-base',
  settings: {
    'import/resolver': {
      webpack: {config: path.join(__dirname, 'webpack.config.js')},
    },
  },
  rules: {
    'import/no-amd': 'off',
    // TODO remove this. use requirejs rules instead
    'no-undef': 'off',
    //  Maybe this is better : no-underscore-dangle: [2, { 'allowAfterThis': true }]
    'no-underscore-dangle': 'off',
    'prefer-rest-params': 'off',
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'no-console': 'off',
    'no-prototype-builtins': 'off',
    'no-param-reassign': ['error', { 'props': false }],
    // 'import/core-modules': ['error', [ 'commons', 'admin' ]],
    'import/extensions': ['error', { '.js': 'never' }],
    // 'import/extensions': ['error', 'always', { 'ignorePackages': true }],
    'max-len': ['error', { 'code': 120 }],
  }
};
