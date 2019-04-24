/**
 * NOTE! this is needed to set the webpack public path on the fly. Do NOT remove.
 * @see https://webpack.js.org/guides/public-path/
 */

const { localBuild = false, debug = false } = __entryscape_config.entryscape;
const { url, app, version } = __entryscape_config.entryscape.static;
if (debug) {
  __webpack_public_path__ = '/'; // eslint-disable-line
} else {
  __webpack_public_path__ = localBuild ? '/dist/' : `${url.endsWith('/') ? url : `${url}/`}${app}/${version}/`; // eslint-disable-line
}
