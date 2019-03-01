import chartist from 'chartist';
import DOMUtil from 'commons/util/htmlUtil';
import chartistPluginLegend from 'chartist-plugin-legend';

let counter = 0;
const renderChart = function (node, data, items) {
  data.options = data.options || {};
  const f = (loadedData) => {
    counter += 1;
    const idClass = `chartist_${counter}`;

    const div = DOMUtil.create('div', { class: `${idClass} ${data.proportion}` });
    node.appendChild(div);
    if (data.width) {
      div.style.width = parseInt(data.width, 10) == data.width ? `${data.width}px` : data.width;
    } else {
      div.style.width = '100%';
    }
    if (data.options.axisX && data.options.axisX.type) {
      data.options.axisX.type = chartist[data.options.axisX.type];
    }
    if (data.options.axisY && data.options.axisY.type) {
      data.options.axisY.type = chartist[data.options.axisY.type];
    }

    if (data.limit) {
      loadedData.labels = loadedData.labels.slice(0, data.limit);
      if (Array.isArray(loadedData.series[0])) {
        loadedData.series = loadedData.series.map(t => t.slice(0, data.limit));
      } else {
        loadedData.series = loadedData.series.slice(0, data.limit);
      }
    }
    if (data.legend) {
      data.options.plugins = [
        chartist.plugins.legend({
          position: 'bottom',
          legendNames: loadedData.labels.map((l, idx) => `${l} (${loadedData.series[idx]})`),
        }),
      ];
      data.options.labelInterpolationFnc = () => '';
      delete loadedData.labels;
    }
    new chartist[data.type](`.${idClass}`, loadedData, data.options, data.responsiveOptions);
  };

  const labelSort = (a, b) => (parseInt(a[0], 10) < parseInt(b[0], 10) ? 1 : -1);
  const valueSort = (a, b) => (a[1] < b[1] ? 1 : -1);
  const simple = (srcData) => {
    if (data.label) {
      data.options.axisY = data.options.axisY || {};
      data.options.axisY.onlyInteger = true;
      const labels = {};
      let labelNumeric;
      const src = srcData.results;
      src.forEach((row) => {
        const l = row[data.label];
        if (labelNumeric !== false) {
          labelNumeric = !isNaN(parseInt(l, 10));
        }
        labels[l] = (labels[l] || 0) + 1;
      });
      const destData = { labels: [], series: [[]] };
      Object.entries(labels).sort(labelNumeric ? labelSort : valueSort).forEach((pair) => {
        destData.labels.push(pair[0]);
        destData.series[0].push(pair[1]);
      });
      return destData;
    }
    return data;
  };

  const transform = { simple }[data.datamodel] || (d => d);

  if (data.data) {
    f(transform(data.data));
  } else if (data.url) {
    fetch(data.url).then(d => d.json()).then(transform).then(f).catch((e) => {
      console.log(e);
    });
  }
};

export default renderChart;
