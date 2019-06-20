import BarChart from 'commons/components/chart/Bar';
import DoughnutChart from 'commons/components/chart/Doughnut';
import DOMUtil from 'commons/util/htmlUtil';
import m from 'mithril';

let counter = 0;

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


const renderChart = (node, data) => {
  const f = (loadedData) => {
    counter += 1;
    const idClass = `chartist_${counter}`;

    // Create node
    const div = DOMUtil.create('div', { class: `${idClass} ${data.proportion}` }, node);

    let filteredData = Object.assign({}, loadedData);
    if (data.limit) {
      filteredData = applyLimit(filteredData, data.limit);
    }

    console.log(loadedData);
    const chartJSData = {
      datasets: [{
        data: Array.isArray(filteredData.series[0]) ? filteredData.series[0] : filteredData.series,
      }],
      labels: filteredData.labels,
    };

    let chartComponent = null;
    const type = data.type;
    switch (type) {
      case 'bar':
      case 'line':
      case 'horizontalBar':
        chartComponent = {
          view: () => m(BarChart, {
            data: chartJSData,
            type,
            dimensions: {
              width: data.width,
              height: data.height,
            },
            options: data.options,
          }),
        };
        break;
      case 'pie':
      case 'doughnut':
        chartComponent = {
          view: () => m(DoughnutChart, {
            data: chartJSData,
            type,
            dimensions: {
              width: data.width,
              height: data.height,
            },
            options: data.options,
          }),
        };
      default:
    }

    m.mount(div, chartComponent);
  };

  if (data.data) {
    f(data.data);
  } else if (data.url) {
    if (data.url.endsWith('.json')) {
      fetch(data.url).then(res => res.json()).then(f);
    } else {
      require([data.url], f);
    }
  }
};

export default renderChart;
