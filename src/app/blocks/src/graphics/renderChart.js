import BarChart from 'commons/components/chart/Bar';
import DoughnutChart from 'commons/components/chart/Doughnut';
import DOMUtil from 'commons/util/htmlUtil';
import m from 'mithril';

/**
 * Return as many items as limit indicates.
 *
 * @todo re-write as pure function
 *
 * @param data
 * @param limit
 */
const applyLimit = (data, limit) => {
  data.labels = data.labels.slice(0, limit);
  if (Array.isArray(data.series[0])) {
    data.series = data.series.map(t => t.slice(0, limit));
  } else {
    data.series = data.series.slice(0, limit);
  }

  return data;
};

/**
 *
 * @param data
 * @return {{datasets: {data: *}[], labels: *}}
 */
const convertToChartJs = data => ({
  datasets: [{
    data: Array.isArray(data.series[0]) ? data.series[0] : data.series,
  }],
  labels: data.labels,
});

/**
 *
 * @param data
 * @param configData
 * @return {{datasets: {data: *}[], labels: *}}
 */
const transformData = (data, configData) => {
  let filteredData = data;
  if (configData.limit) {
    filteredData = applyLimit(filteredData, configData.limit);
  }

  return convertToChartJs(filteredData);
};

/**
 * Match block config data with mithril chart component
 *
 * @param node
 * @param configData
 * @param rawData
 */
const renderChartComponent = (node, configData, rawData) => {
  // transform fetched data
  const data = transformData(Object.assign({}, rawData), configData);

  // prepare chartjs options
  const type = configData.type;
  const options = {
    data,
    type: configData.type,
    dimensions: {
      width: configData.width,
      height: configData.height,
    },
    options: configData.options,
  };

  // find suitable chatjs component
  let chartComponent = null;
  switch (type) {
    case 'bar':
    case 'line':
    case 'horizontalBar':
      chartComponent = { view: () => m(BarChart, options) };
      break;
    case 'pie':
    case 'doughnut':
      chartComponent = { view: () => m(DoughnutChart, options) };
      break;
    default:
  }

  m.mount(DOMUtil.create('div', {}, node), chartComponent);
};

export default (node, configData) => {
  if (configData.data) {
    renderChartComponent(node, configData.data);
  } else if (configData.url) {
    if (configData.url.endsWith('.json')) {
      fetch(configData.url)
        .then(res => res.json())
        .then(data => renderChartComponent(node, configData, data));
    } else {
      require([configData.url], data => renderChartComponent(node, configData, data));
    }
  }
};
