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
  const { year = null } = filters;
  let { date = null, month = null } = filters;
  if ((date && (!month || !year) && (month && !year))) {
    throw Error('Incorrect date filters passed to the statistics api request generator');
  }

  // convert to human understandable calendar month and append a 0 if it's a one digit number
  if (month) {
    month += 1;
    month = month < 10 ? `0${month}` : `${month}`;
  }

  if (date) {
    date = date < 10 ? `0${date}` : `${date}`;
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

/**
 * Generate a collection of time ranges corresponding to api requests.
 * Currently does this semi-smartly, by utilizing as much as possible 'year' and 'month' api requests
 * rather than individual 'day' requests.
 *
 * @param timeRange
 * @return {Array}
 */
const getAggregateFilters = (timeRange) => {
  const { start, end } = timeRange;
  const today = new Date();
  const hasEndDateToday = !end.diff(today, 'days');

  /**
   * Keep a collection of filters which correspond to the api requests for a custom time range
   * @type {Array}
   */
  const filters = [];

  /**
   * Add to the collection of filters
   *
   * @param year
   * @param month
   * @param date
   */
  const addFilter = (year, month = -1, date = -1) => {
    const filter = { year };

    if (month > -1) { // month can be 0
      filter.month = month;
      if (date > -1) {
        filter.date = date;
      }
    }

    filters.push(filter);
  };

  // start === end
  if (start.diff(end, 'days') === 0) {
    addFilter(start.year(), start.month(), start.date());
    return filters;
  }

  // generate year filters
  const differentYear = start.year() !== end.year();
  if (differentYear) {
    for (let year = start.year() + 1; year < end.year(); year++) {
      addFilter(year);
    }
  }
  if (differentYear && hasEndDateToday) {
    addFilter(end.year());
  }

  // generate month filters
  const differentMonth = differentYear || start.month() !== end.month();
  const endMonth = differentYear ? 12 : end.month();
  if (differentYear || differentMonth) {
    for (let month = start.month() + 1; month < endMonth; month++) {
      addFilter(start.year(), month);
    }
  }

  // generate day filters
  // if the start date is 1 and end date is either end of month or today
  if (start.date() === 1) {
    // you need to add month instead of days
    if (differentMonth || (!differentMonth && hasEndDateToday)) {
      addFilter(start.year(), start.month());
    }
  } else {
    // start dates (days) in start month and end dates in start month
    const endDate = differentYear || differentMonth ? start.daysInMonth() : end.date();
    for (let date = start.date(); date < endDate + 1; date++) {
      addFilter(start.year(), start.month(), date);
    }
  }

  if (end.date() === end.daysInMonth() || hasEndDateToday) {
    // you need to add month instead of days
    if (differentMonth && !differentYear) {
      addFilter(end.year(), end.month());
    }
  } else if (differentMonth) {
    // end dates (days) in end month
    for (let date = 1; date < end.date() + 1; date++) {
      addFilter(end.year(), end.month(), date);
    }
  }

  return filters;
};

/**
 *
 * @param contextId
 * @param type
 * @param customRange
 * @return {Promise<{count: *, uri: *}[]>}
 */
const getTopStatisticsAggregate = async (contextId, type = 'file', customRange = {}) => {
  const filters = getAggregateFilters(customRange);

  const uri2Count = new Map();
  const aggregateURICount = (countInfos) => {
    countInfos.forEach((info) => {
      const { uri, count } = info;
      if (uri2Count.has(uri)) {
        const currentCount = uri2Count.get(uri);
        uri2Count.set(uri, currentCount + count);
      } else {
        uri2Count.set(uri, count);
      }
    });
  };

  await Promise.all(
    filters.map(
      filter => getTopStatistics(contextId, type, filter).then(aggregateURICount)),
  );

  // 1 convert map to array and sort, descending order
  // 2 convert it back to an object { uri, count }
  return [...uri2Count]
    .sort((a, b) => b[1] - a[1])
    .map(info => ({ uri: info[0], count: info[1] }));
};


export default {
  getTopStatistics,
  getTopStatisticsAggregate,
  getTopStatisticsStartAndEnd,
  getEntryStatistics,
};
