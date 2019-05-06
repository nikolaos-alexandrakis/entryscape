import escaStatistics from 'catalog/nls/escaStatistics.nls';
import Chart from 'chart.js';
import { i18n } from 'esi18n';
import './index.scss';

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

const getNewChart = (ctx, type, displayLegend) => {
  return new Chart(ctx, {
    type,
    options: {
      maintainAspectRatio: false,
      legend: {
        display: displayLegend,
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
        }],
      },
    },
  });
};

export default () => {
  let chart;

  return {
    oninit() {
      this.elementId = `CHART${parseInt(Math.random() * 10000, 10)}`;
    },
    oncreate(vnode) {
      const { type = 'bar', displayLegend = true } = vnode.attrs;
      chart = getNewChart(document.getElementById(this.elementId), type, displayLegend);
      m.redraw();
    },
    onupdate(vnode) {
      const { type = 'bar' } = vnode.attrs;
      if (chart && type !== chart.config.type) {
        chart.destroy();
        chart = getNewChart(document.getElementById(this.elementId), type);
      }
    },
    view(vnode) {
      const { data, chartDimensions = {} } = vnode.attrs;
      const { width = 400, height = 400 } = chartDimensions;

      let noData = true;
      if (chart && data) {
        noData = false;
        // update chart data and xAxis if needed
        chart.data = {
          labels: data[0].xLabels,
          datasets: data.map(dataset => ({
            labels: dataset.xLabels,
            data: dataset.yData,
            label: dataset.label || '',
          })),
        };

        // update chart colors and axes and re-render
        if (chart.data.datasets) {
          const colorOptionsCount = COLOR_OPTIONS.length;
          chart.data.datasets.forEach((dataset, idx) => {
            const colorIdx = idx % colorOptionsCount; // repeat colors
            Object.assign(chart.data.datasets[idx], { ...COLOR_OPTIONS[colorIdx] }); // shallow is fine
          });
          // chart.options.scales.xAxes[0].time.unit = timeUnit;

          chart.update();
        }
      }

      return (
        <div className="chart-container">
          <div
            className={`no-data ${noData ? '' : 'hidden'}`}
          >
            {i18n.localize(escaStatistics, 'timeRangeNoDataAvailable')}
          </div>
          <canvas
            className={` ${noData ? '' : ''}`}
            id={this.elementId}
            config={this.setCanvasRef}
            width={width}
            height={height}
            aria-label="Visualization chart" role="img"
          />
        </div>
      );
    },
  };
};
