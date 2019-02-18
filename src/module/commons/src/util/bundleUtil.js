import { isUri } from 'commons/util/util';
import configUtil from './configUtil';

/**
 * A fallback utility to fetch rdforms templates
 */

const getBaseUrl = () => configUtil.getBaseUrl().replace(/\/?$/, '/');
const getThemeUrl = () => `${getBaseUrl()}theme/templates`;
const getStaticTemplateUrl = () => `${configUtil.getStaticBuild()}templates`;

/**
 * NOTE! order matters here
 * @returns {Array<string>}
 */
export const getFallbackUrls = (id, format) => [
  getThemeUrl,
  getStaticTemplateUrl,
].map(baseUrlFunc => `${baseUrlFunc()}/${id}.${format}`);

/**
 * Get an array of fallback urls where a specific bundle may be found.
 * Can be also passed a full url which would ignore the fallback mechanism
 *
 * @param {string} id The id of the bundle or a full url
 * @param {string} [format=json]
 * @return {Array<string>}
 */
export const getFallbackBundleUrls = (id, format = 'json') =>
  (isUri(id) ? [id] : getFallbackUrls(id, format));
