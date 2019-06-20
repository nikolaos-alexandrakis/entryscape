import { getRandomInt } from 'commons/util/util';
import { COLOURS_PLACEHOLDER } from '../colors';
import './index.scss';

export default () => {
  let chart;

  return {
    oncreate(vnode) {
      import(/* webpackChunkName: "chart.js" */ 'chart.js')
        .then(Chart => Chart.default)
        .then((Chart) => {
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
                backgroundColor: COLOURS_PLACEHOLDER[0].backgroundColor,
                borderColor: COLOURS_PLACEHOLDER[0].borderColor,
                borderWidth: 1,
                data: Array(12).forEach(a => getRandomInt(12)),
              }, {
                label: 'Dataset 2',
                backgroundColor: COLOURS_PLACEHOLDER[1].backgroundColor,
                borderColor: COLOURS_PLACEHOLDER[1].borderColor,
                data: Array(12).forEach(a => getRandomInt(12)),
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
        <h3 class="placeholder__text">{text}</h3>
      </div>;
    },
  };
};
