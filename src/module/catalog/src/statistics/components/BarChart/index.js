import Chartist from 'chartist';
import 'chartist-plugin-legend';
// Create a simple bar chart
import moment from 'moment'; //@todo valentino


let chart; // @todo @valentino

/**
 * @todo @valentino
 *  nls
 */

export default () => ({
  oncreate(vnode) {
    chart = new Chartist.Bar('.ct-chart', vnode.attrs.data, {
      axisX: {
        type: Chartist.FixedScaleAxis,
        divisor: 5,
        labelInterpolationFnc(value) {
          return moment(value).format('MMM D');
        },
      },
    });
  },
  view(vnode) {
    const { data } = vnode.attrs;
    if (chart) {
      chart.update(data);
    }
    console.log(chart);
    // chart.update({ series: data });
    // update chart vnode.state.chart

    return <div className="ct-chart"/>;
  },
});
