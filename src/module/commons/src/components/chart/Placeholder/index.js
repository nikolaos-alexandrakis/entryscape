import Chart from 'chart.js';

const COLOR_OPTIONS = [
  {
    backgroundColor: 'rgba(0, 131, 143,0.05)',
  },
  {
    backgroundColor: 'rgba(22, 91, 152,0.05)',
  },
];

export default () => {
  let chart;

  return {
    oninit(vnode) {
      const { text } = vnode.attrs;
      vnode.state.middleCaptionPlugin = {
        id: 'middle-caption',
        beforeDraw(paramChart) {
          const width = paramChart.chart.width;
          const height = paramChart.chart.height;
          const ctx = paramChart.chart.ctx;
          ctx.restore();
          const fontSize = (height / 190).toFixed(2);
          ctx.font = `${fontSize}em sans-serif`;
          ctx.textBaseline = 'middle';
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2;
          ctx.fillText(text, textX, textY);
          ctx.save();
        },
      };
    },
    oncreate(vnode) {
      chart = new Chart(vnode.dom.children[0], {
        type: 'bar',
        options: {
          maintainAspectRatio: false,
          tooltips: {
            enabled: false,
          },
          hover: {
            mode: null,
          },
        },
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Dataset 1',
            backgroundColor: COLOR_OPTIONS[0].backgroundColor,
            borderColor: COLOR_OPTIONS[0].borderColor,
            borderWidth: 1,
            data: [5, 8, 4, 6, 2, 8, 9, 10, 11, 14, 5, 12],
          }, {
            label: 'Dataset 2',
            backgroundColor: COLOR_OPTIONS[1].backgroundColor,
            borderColor: COLOR_OPTIONS[1].borderColor,
            data: [5, 5, 4, 6, 7, 8, 9, 6, 10, 10, 7, 12],
          }],
        },
      });

      Chart.pluginService.register(vnode.state.middleCaptionPlugin);

      chart.update();
    },
    onremove(vnode) {
      Chart.pluginService.unregister(vnode.state.middleCaptionPlugin);
    },
    view() {
      return <div className="chart-container">
        <canvas aria-label="Statistics placeholder" role="img"/>
      </div>;
    },
  };
};
