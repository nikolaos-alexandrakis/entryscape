import config from 'config';
import m from 'mithril';

/**
 * {base-uri}/statistics/{context-id}/top/{type}/{year}/{month}/{day}
 * {base-uri}/statistics/{context-id}/{entry-id}/{year}/{month}/{day}
 */

const STATS_BASE_URL = 'https://stats.infra.entryscape.com/v.dev.entryscape.com/' || `${config.get('entrystore.repository')}/statistics`;

/**
 *
 * @param filters
 * @return {string}
 */
const applyFilters = (filters) => {
  const { year = null, month = null, day = null } = filters;
  if ((day && (!month || !year) && (month && !year))) {
    throw Error('Incorrect date filters passed to the statistics api request generator');
  }

  return `${year ? `${year}/` : ''}${month ? `${month}/` : ''}${day ? `${day}/` : ''}`;
};

/**
 *
 * @param contextId
 * @param type
 * @param filters
 * @return {*}
 */
const getTopStatistics = (contextId, type = 'all', filters = {}) => {
  let requestURL = `${STATS_BASE_URL}${contextId}/${`top/${type}/`}`;
  requestURL = `${requestURL}${applyFilters(filters)}`;

  return fetch(requestURL)
    .then(res => {
      if (res.status === 404) {
        return { _: [] };
      }
      return res.json();
    })
    .then(response => response._);

  // return m.request(requestURL)
  //   .then(res => res.json())
  // .then(response => response._);
};

/**
 *
 * @param contextId
 * @param entryId
 * @param filters
 * @return {*}
 */
const getEntryStatistics = (contextId, entryId, filters = {}) => {
  let requestURL = `${STATS_BASE_URL}${contextId}/${entryId}/`;
  requestURL = `${requestURL}${applyFilters(filters)}`;

  return m.request(requestURL)
    .then(res => res.json())
    .then(response => response._);
};


export default {
  getTopStatistics,
  getEntryStatistics,
};
