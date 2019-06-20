import BarChart from 'commons/components/chart/BarChart';
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
    if (data.width) {
      div.style.width = parseInt(data.width, 10) == data.width ? `${data.width}px` : data.width;
    } else {
      div.style.width = '100%';
    }

    let filteredData = Object.assign({}, loadedData);
    if (data.limit) {
      filteredData = applyLimit(filteredData, data.limit);
    }

    const chartJSData = {
      datasets: [{
        data: filteredData.series[0],
      }],
      labels: filteredData.labels,
    };

    m.mount(div, {
      view: () => m(BarChart, {
        data: chartJSData,
        type: 'horizontalBar',
      }),
    });
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
