import escaStatistics from 'catalog/nls/escaStatistics.nls';
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
      const { data, options = {}, colors = [], chartDimensions = {} } = vnode.attrs;
      const { width = 400, height = 400 } = chartDimensions; // @todo @valentino are these used?

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

      return (<div className="chart-container">
        <div
          className={`no-data ${noData ? '' : 'd-none'}`}>{i18n.localize(escaStatistics, 'timeRangeNoDataAvailable')}</div>
        <canvas
          className={` ${noData ? 'd-none' : ''}`}
          width={width}
          height={height}
          aria-label="Statistics chart" role="img"/>
      </div>);
    },
  };
};
