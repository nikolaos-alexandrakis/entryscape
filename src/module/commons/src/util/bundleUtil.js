import configUtil from './configUtil';
import config from 'config';

/**
 * A fallback utility to fetch rdforms templates
 */

const getBaseUrl = () => configUtil.getBaseUrl().replace(/\/?$/, '/');
const getTemplateUrl = () => `${getBaseUrl()}dist/templates`;
const getThemeUrl = () => `${getBaseUrl()}theme`;
const getStaticTemplateUrl = () => `${configUtil.getStaticBuild()}templates`;

/**
 * NOTE! order matters here
 */

export const getFallbackUrls = (id) => [
  getTemplateUrl(),
  getThemeUrl(),
  getStaticTemplateUrl(),
];

export const getFallbackBundleUrls = (id, format = 'json') => getFallbackUrls().map(b => `${b}/${id}.${format}`);
