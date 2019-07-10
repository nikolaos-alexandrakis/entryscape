import escaStatisticsNLS from 'catalog/nls/escaStatistics.nls';
import { COLOURS_BAR_CHART } from 'commons/components/chart/colors';
import { i18n } from 'esi18n';

export default () => {
  let chart;

  return {
    oncreate(vnode) {
      import(/* webpackChunkName: "chart.js" */ 'chart.js')
        .then(Chart => Chart.default)
        .then((Chart) => {
          const canvasNode = vnode.dom.getElementsByTagName('canvas')[0];
          const { type = 'bar', options = {} } = vnode.attrs;

          chart = new Chart(canvasNode, {
            type,
            options,
          });

          m.redraw();
        });
    },
    view(vnode) {
      const { data, colors = [], dimensions = {} } = vnode.attrs;
      const { width = '100%', height = '100%' } = dimensions;

      let noData = true;
      if (chart && data
        && data.datasets && data.datasets.length > 0
        && data.datasets[0].data.length > 0) { // @todo refactor
        noData = false;

        // update chart data
        chart.data = {
          labels: [],
          ...data,
        };

        // merge colours to apply
        const colorsToApply = [...colors, ...COLOURS_BAR_CHART];

        // update chart colors and axes and re-render
        if (chart.data.datasets) {
          const colorOptionsCount = colorsToApply.length;
          chart.data.datasets.forEach((dataset, idx) => {
            const colorIdx = idx % colorOptionsCount; // repeat colors
            Object.assign(chart.data.datasets[idx], { ...colorsToApply[colorIdx] }); // shallow is fine
          });

          chart.update();
        }
      }

      const escaStatistics = i18n.getLocalization(escaStatisticsNLS);
      return (<div className="chart-container" style={`position: relative; height:${height}; width:${width}`}>
        <div className={`no-data ${noData ? '' : 'd-none'}`}>{escaStatistics.timeRangeNoDataAvailable}</div>
        <canvas className={` ${noData ? 'd-none' : ''}`} aria-label="Statistics chart" role="img"/>
      </div>);
    },
  };
};
