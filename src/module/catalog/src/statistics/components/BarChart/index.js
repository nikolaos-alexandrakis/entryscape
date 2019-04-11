import escaStatistics from 'catalog/nls/escaStatistics.nls';
import Chart from 'chart.js';
// import Chartist from 'chartist';
import 'chartist-plugin-legend';
import 'chartist-plugin-tooltips';
import 'chartist-plugin-tooltips/dist/chartist-plugin-tooltip.css';
import { i18n } from 'esi18n';
// import moment from 'moment'; // @todo valentino
import './index.scss';

let chart; // @todo @valentino

const getChartOptions = (xAxisDateFormat = 'MMM D') => ({
  showLine: false,
  axisX: {
    offset: 20,
    type: Chartist.FixedScaleAxis,
    divisor: 5,
    ticks: [
      new Date(2019, 0),
      new Date(2019, 1),
      new Date(2019, 2),
      new Date(2019, 3),
      new Date(2019, 4),
      new Date(2019, 5),
      new Date(2019, 6),
      new Date(2019, 7),
      new Date(2019, 8),
      new Date(2019, 9),
      new Date(2019, 10),
      new Date(2019, 11),
    ],
    labelInterpolationFnc(value) {
      console.log(value);
      return moment(value).format(xAxisDateFormat);
      // return moment(value);
    },
  },
  axisY: {
    type: Chartist.AutoScaleAxis,
    onlyInteger: true,
    // offset: 10,
  },
  // low: 0,
  plugins: [
    Chartist.plugins.tooltip({
      appendToBody: true,
      transformTooltipTextFnc: (value) => {
        const [timestamp, downloadCount] = value.split(',');
        const date = moment(parseInt(timestamp, 10));
        return `${downloadCount} downloads on ${date.format('ll')}`;
      },
    }),
  ],
});

/**
 * Given a length guess what date format is appropriate to render.
 *
 * @param {number} dataLength
 * @return {string}
 */
const guessAxisFormatFromData = (dataLength) => {
  let xAxisDateFormat = 'MMM D';
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
      type: 'line',
      options: {
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
      chart.data = { datasets: [{ data, label }] };
      chart.options.scales.xAxes[0].time.unit = timeUnit;
      chart.update();
    }
    return (<div>
      <div
        className={`no-data ${noData ? '' : 'hidden'}`}>{i18n.localize(escaStatistics, 'timeRangeNoDataAvailable')}</div>
      <canvas id="myChart" width="400" height="400"></canvas>
    </div>);
  },
});
