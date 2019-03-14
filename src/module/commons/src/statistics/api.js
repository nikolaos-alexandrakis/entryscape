import config from 'config';
import m from 'mithril';

/**
 * {base-uri}/statistics/{context-id}/top/{type}/{year}/{month}/{day}
 * {base-uri}/statistics/{context-id}/{entry-id}/{year}/{month}/{day}
 */

const STATS_BASE_URL = 'https://stats.infra.entryscape.com/v.dev.entryscape.com/' || `${config.get('entrystore.repository')}/statistics`;


const getTopStatisticsStartAndEnd = (contextId, type = 'file') => {
  const requestURL = `${STATS_BASE_URL}${contextId}/${`top/${type}/`}`;

  return fetch(requestURL)
    .then(r => r.json())
    .then(data => ({ start: new Date(data.start), end: new Date(data.end) }));
};

/**
 *
 * @param filters
 * @return {string}
 */
const applyFilters = (filters) => {
  const { year = null, month = null, date = null } = filters;
  if ((date && (!month || !year) && (month && !year))) {
    throw Error('Incorrect date filters passed to the statistics api request generator');
  }

  return `${year ? `${year}/` : ''}${month ? `${month}/` : ''}${date ? `${date}/` : ''}`;
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
    .then((response) => {
      if (response.status === 404) {
        return { _: [] };
      }
      return response.json();
    })
    .then(res => res._);
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

const getTopStatisticsAggregate = async (contextId, type = 'file', customRange = {}) => {
  const { start, end } = customRange;

  // start == end => today
  if (start.diff(end, 'days') === 0) {
    const date = new Date();

    return getTopStatistics(contextId, type, {
      year: date.getFullYear(),
      month: date.getMonth(),
      date: date.getMonth,
    });
  }

  // @todo @valentino guard against the case 1 Feb - 31 March
  const filters = [];

  const differentYear = start.year() !== end.year();
  if (differentYear) {
    for (let year = start.year() + 1; year < end.year(); year++) {
      filters.push({ year });
    }
  }

  const differentMonth = start.month() !== end.month();
  const endMonth = differentYear ? 12 : end.month();
  if (differentYear || differentMonth) {
    for (let month = start.month() + 1; month < endMonth; month++) {
      filters.push({
        month,
        year: start.year(),
      });
    }
  }

  const endDate = differentYear || differentMonth ? start.daysInMonth() + 1 : end.date();
  for (let date = start.date(); date < endDate; date++) {
    filters.push({
      date,
      month: start.month() + 1 < 10 ? `0${start.month() + 1}` : (start.month() + 1),
      year: start.year(),
    });
  }

  for (let date = 1; date < end.date() + 1; date++) {
    filters.push({
      date,
      month: end.month() + 1 < 10 ? `0${end.month() + 1}` : (end.month() + 1),
      year: end.year(),
    });
  }
 const allStats = [];
  try {
    const handlePromise = val => allStats.push(val);
    filters.map(filter => getTopStatistics(contextId, type, filter).then(handlePromise, handlePromise));
  } catch (err) {
    console.log('error');
  }

  setTimeout(() => {
    allStats.forEach((stat) => {
      if (stat.length > 0) {
        console.log(stat);
      }
    });
  }, 3000);
};

export default {
  getTopStatistics,
  getTopStatisticsAggregate,
  getTopStatisticsStartAndEnd,
  getEntryStatistics,
};
