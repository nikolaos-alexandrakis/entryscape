import escaStatistics from 'catalog/nls/escaStatistics.nls';
import Chart from 'chart.js';
import { i18n } from 'esi18n';

const BACKGROUND_COLOURS = [
  'rgba(251, 192, 45,0.6)',
  'rgba(179, 157, 219,0.6)',
];

export default () => {
  let chart;

  return {
    oncreate(vnode) {
      const canvasNode = vnode.dom.getElementsByTagName('canvas')[0];
      chart = new Chart(canvasNode, {
        type: 'doughnut',
        options: {
          circumference: Math.PI, // half doughnut
          rotation: -Math.PI,
        },
      });
    },

    view(vnode) {
      const { data } = vnode.attrs;

      let noData = true;
      if (chart && data
        && data.datasets && data.datasets.length > 0
        && data.datasets[0].data.length > 0) { // @todo refactor
        noData = false;

        // update chart data and xAxis if needed

        data.datasets[0].backgroundColor = BACKGROUND_COLOURS;
        chart.data = data;
        chart.update();
      }

      return (<div className="chart-container">
        <div
          className={`no-data ${noData ? '' : 'hidden'}`}>{i18n.localize(escaStatistics, 'timeRangeNoDataAvailable')}</div>
        <canvas
          className={` ${noData ? 'hidden' : ''}`}
          aria-label="Statistics chart" role="img"/>
      </div>);
    },
  };
};
