import m from 'mithril';
import { COLOURS_PLACEHOLDER } from '../colors';
import './index.scss';

export default () => {
  let chart;

  return {
    oncreate(vnode) {
      import(/* webpackChunkName: "chart.js" */ 'chart.js')
        .then(Chart => Chart.default)
        .then((Chart) => {
          const node = vnode.dom.getElementsByTagName('canvas')[0];
          chart = new Chart(node, {
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
                backgroundColor: COLOURS_PLACEHOLDER[0].backgroundColor,
                borderColor: COLOURS_PLACEHOLDER[0].borderColor,
                borderWidth: 1,
                data: [5, 8, 4, 6, 7, 8, 9, 10, 11, 14, 5, 12],
              }, {
                label: 'Dataset 2',
                backgroundColor: COLOURS_PLACEHOLDER[1].backgroundColor,
                borderColor: COLOURS_PLACEHOLDER[1].borderColor,
                data: [2, 8, 4, 5, 9, 8, 9, 4, 16, 8, 5, 10],
              }],
            },
          });

          chart.update();
        });
    },
    view(vnode) {
      const { text } = vnode.attrs;
      return <div className="chart-container">
        <canvas aria-label="Statistics placeholder" role="img"/>
        <h3 className="placeholder__text">{text}</h3>
      </div>;
    },
  };
};
