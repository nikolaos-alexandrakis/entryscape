import escaStatistics from 'catalog/nls/escaStatistics.nls';
import Chart from 'chart.js';
import 'chartist-plugin-legend';
import 'chartist-plugin-tooltips';
import 'chartist-plugin-tooltips/dist/chartist-plugin-tooltip.css';
import { i18n } from 'esi18n';
import './index.scss';

let chart; // @todo @valentino

/**
 * Given a length guess what date format is appropriate to render.
 *
 * @param {number} dataLength
 * @return {string}
 */
const guessAxisFormatFromData = (dataLength) => {
  let xAxisDateFormat = 'day';
  if (dataLength < 13) {
    xAxisDateFormat = 'month';
  } else if (dataLength < 25) {
    xAxisDateFormat = 'hour';
  } else if (dataLength < 32) {
    xAxisDateFormat = 'day';
  }

  return xAxisDateFormat;
};

export default () => ({
  oncreate() {
    // chart = new Chartist.Bar('.ct-chart', vnode.attrs.data, getChartOptions());
    const ctx = document.getElementById('myChart');
    chart = new Chart(ctx, {
      type: 'bar',
      options: {
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'month',
            },
          }],
        },
      },
    });
  },
  view(vnode) {
    const { data, name: label } = vnode.attrs;
    let noData = true;
    if (chart && data) {
      noData = false;
      const timeUnit = guessAxisFormatFromData(data.length);

      // update chart data and xAxis if needed
      chart.data = {labels:[], datasets: [{ data, label, borderColor: '#165b98', backgroundColor: 'rgba(22, 91, 152,0.2)', borderWidth: 3 }] };
      chart.options.scales.xAxes[0].time.unit = timeUnit;
      chart.update();
    }
    return (<div class="chart-container">
      <div
        className={`no-data ${noData ? '' : 'hidden'}`}>{i18n.localize(escaStatistics, 'timeRangeNoDataAvailable')}</div>
      <canvas id="myChart" width="400" height="400"></canvas>
    </div>);
  },
});
