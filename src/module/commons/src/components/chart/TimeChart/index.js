import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { i18n } from 'esi18n';
import moment from 'moment/moment';

/**
 * Given a length guess what date format is appropriate to render.
 *
 * @param {number} dataLength
 * @return {string}
 */
const guessAxisFormatFromData = (dataLength) => {
  let xAxisDateFormat = 'day';
  if (dataLength > 10 && dataLength < 13) {
    xAxisDateFormat = 'month';
  } else if (dataLength > 13 && dataLength < 25) {
    xAxisDateFormat = 'hour';
  } else if (dataLength > 25 && dataLength < 32) {
    xAxisDateFormat = 'day';
  }

  return xAxisDateFormat;
};


const COLOR_OPTIONS = [
  {
    borderColor: '#00838f',
    backgroundColor: 'rgba(0, 131, 143,0.2)',
    borderWidth: 3,
  },
  {
    borderColor: '#165b98',
    backgroundColor: 'rgba(22, 91, 152,0.2)',
    borderWidth: 3,
  },
  {
    borderColor: '#aed581',
    backgroundColor: 'rgba(174, 213, 129,0.2)',
    borderWidth: 3,
  },
  {
    borderColor: '#fbc02d',
    backgroundColor: 'rgba(251, 192, 45,0.2)',
    borderWidth: 3,
  },
  {
    borderColor: '#e91e63',
    backgroundColor: 'rgba(233, 30, 99,0.2)',
    borderWidth: 3,
  },
];

export default () => {
  let chart;

  const updateXAxis = (vnode) => {
    if (chart) {
      const { data } = vnode.attrs;
      if (data && data.datasets && data.datasets.length > 0) {
        const numberOfDataPoints = data.datasets[0].data.length;
        const type = guessAxisFormatFromData(numberOfDataPoints);
        if (vnode.state && vnode.state.type !== type) {
          vnode.state.type = type;

          let titleCallback;
          switch (type) {
            case 'hour':
              titleCallback = items => moment(items[0].label).format('MMMM Do YYYY, h A');
              break;
            case 'day':
              titleCallback = items => moment(items[0].label).format('MMM Do, YYYY');
              break;
            case 'month':
              titleCallback = items => moment(items[0].label).format('MMMM YYYY');
              break;
            default:
          }
          chart.options.tooltips.callbacks.title = titleCallback;
        }
      }
    }
  };

  return {
    oncreate(vnode) {
      import(/* webpackChunkName: "chart.js" */ 'chart.js')
        .then(Chart => Chart.default)
        .then((Chart) => {
          const canvasNode = vnode.dom.getElementsByTagName('canvas')[0];
          const { type = 'bar', offset = true} = vnode.attrs;

          chart = new Chart(canvasNode, {
            type,
            options: {
              maintainAspectRatio: false,
              tooltips: {
                callbacks: {
                  title(item) {
                    return moment(item[0].label).format('MMM Do, YYYY');
                  },
                },
              },
              scales: {
                xAxes: [{
                  type: 'time',
                  time: {
                    unit: 'month',
                  },
                  offset,
                }],
                yAxes: [{
                  ticks: {
                    min: 0,
                    precision: 0,
                  },
                }],
              },
            },
          });

          updateXAxis(vnode);
          m.redraw();
        });
    },

    onbeforeupdate: updateXAxis,

    view(vnode) {
      const { data, chartDimensions = {} } = vnode.attrs;
      const { width = 400, height = 400 } = chartDimensions; // @todo @valentino are these used?

      let noData = true;
      if (chart && data
        && data.datasets && data.datasets.length > 0
        && data.datasets[0].data.length > 0) { // @todo refactor
        noData = false;
        const numberOfDataPoints = data.datasets[0].data.length;
        const timeUnit = guessAxisFormatFromData(numberOfDataPoints);

        // update chart data and xAxis if needed
        chart.data = {
          labels: [],
          ...data,
        };

        // update chart colors and axes and re-render
        if (chart.data.datasets) {
          const colorOptionsCount = COLOR_OPTIONS.length;
          chart.data.datasets.forEach((dataset, idx) => {
            const colorIdx = idx % colorOptionsCount; // repeat colors
            Object.assign(chart.data.datasets[idx], { ...COLOR_OPTIONS[colorIdx] }); // shallow is fine
          });
          chart.options.scales.xAxes[0].time.unit = timeUnit;

          chart.update();
        }
      }

      return (<div className="chart-container">
        <div
          className={`no-data ${noData ? '' : 'd-none'}`}>{i18n.localize(escaStatistics, 'timeRangeNoDataAvailable')}</div>
        <canvas
          className={` ${noData ? 'hidden' : ''}`}
          width={width}
          height={height}
          aria-label="Statistics chart" role="img"/>
      </div>);
    },
  };
};