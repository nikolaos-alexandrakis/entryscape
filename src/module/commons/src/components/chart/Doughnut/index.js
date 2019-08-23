import escaStatisticsNLS from 'catalog/nls/escaStatistics.nls';
import { COLOURS_PIE } from 'commons/components/chart/colors';
import { i18n } from 'esi18n';

export default () => {
  let chart;

  return {
    oncreate(vnode) {
      import(/* webpackChunkName: "chart.js" */ 'chart.js')
        .then(Chart => Chart.default)
        .then((Chart) => {
          const canvasNode = vnode.dom.getElementsByTagName('canvas')[0];
          const { type = 'doughnut' } = vnode.attrs;
          const options = type === 'doughnut' ? {
            circumference: Math.PI, // half doughnut
            rotation: -Math.PI,
          } : {
            legend: {
              position: 'right',
            },
          };

          chart = new Chart(canvasNode, {
            type,
            options,
          });

          m.redraw();
        });
    },

    view(vnode) {
      const { data, colors = [] } = vnode.attrs;

      let noData = true;
      if (chart && data
        && data.datasets && data.datasets.length > 0
        && data.datasets[0].data.length > 0) { // @todo refactor
        noData = false;

        // update chart data and xAxis if needed

        data.datasets[0].backgroundColor = [...colors, ...COLOURS_PIE];
        chart.data = data;
        chart.update();
      }

      const escaStatistics = i18n.getLocalization(escaStatisticsNLS);
      return (<div className="chart-container">
        <div className={`no-data ${noData ? '' : 'd-none'}`}>{escaStatistics.timeRangeNoDataAvailable}</div>
        <canvas
          className={` ${noData ? 'd-none' : ''}`}
          aria-label="Statistics chart"
          role="img"/>
      </div>);
    },
  };
};
