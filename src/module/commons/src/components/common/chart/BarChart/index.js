import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { i18n } from 'esi18n';

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

  return {
    oncreate(vnode) {
      import(/* webpackChunkName: "chart.js" */ 'chart.js')
        .then(Chart => Chart.default)
        .then((Chart) => {
          const canvasNode = vnode.dom.getElementsByTagName('canvas')[0];
          const { type = 'bar' } = vnode.attrs;

          chart = new Chart(canvasNode, {
            type,
            options: {
              scales: {
                yAxes: [{
                  barThickness: 6,
                }],
              },
            },
          });

          m.redraw();
        });
    },


    view(vnode) {
      const { data, chartDimensions = {} } = vnode.attrs;
      const { width = 400, height = 400 } = chartDimensions; // @todo @valentino are these used?

      let noData = true;
      if (chart && data
        && data.datasets && data.datasets.length > 0
        && data.datasets[0].data.length > 0) { // @todo refactor
        noData = false;

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
