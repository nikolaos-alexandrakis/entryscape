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
 */

export const getFallbackUrls = (id, format) => [
  getThemeUrl,
  getStaticTemplateUrl,
].map(baseUrlFunc => `${baseUrlFunc()}/${id}.${format}`);

export const getFallbackBundleUrls = (id, format = 'json') => {
  const fallbackUrls = getFallbackUrls(id, format);
  if (isUri(id)) {
    return [`${id}.${format}`, ...fallbackUrls];
  }

  return fallbackUrls;
};
