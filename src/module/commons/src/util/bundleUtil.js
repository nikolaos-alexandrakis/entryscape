import configUtil from './configUtil';

/**
 * A fallback utility to fetch rdforms templates
 */

const getBaseUrl = () => configUtil.getBaseUrl().replace(/\/?$/, '/');
const getThemeUrl = () => `${getBaseUrl()}theme`;
const getStaticTemplateUrl = () => `${configUtil.getStaticBuild()}templates`;

/**
 * NOTE! order matters here
 */

export const getFallbackUrls = () => [
  getThemeUrl(),
  getStaticTemplateUrl(),
];

export const getFallbackBundleUrls = (id, format = 'json') => getFallbackUrls().map(b => `${b}/${id}.${format}`);
