import Chartist from 'chartist';
import 'chartist-plugin-legend';
import moment from 'moment'; // @todo valentino
import './index.scss';

let chart; // @todo @valentino

/**
 * @todo @valentino
 *  nls
 */

const getChartOptions = (xAxisDateFormat = 'MMM D') => ({
  axisX: {
    type: Chartist.FixedScaleAxis,
    divisor: 5,
    labelInterpolationFnc(value) {
      return moment(value).format(xAxisDateFormat);
    },
  },
});

const guessAxisFormatFromData = (dataLength) => {
  let xAxisDateFormat = 'MMM D';
  if (dataLength < 13) {
    xAxisDateFormat = 'MMM YY';
  } else if (dataLength < 25) {
    xAxisDateFormat = 'H HH';
  } else if (dataLength < 32) {
    xAxisDateFormat = 'MMM D';
  }

  return xAxisDateFormat;
};

export default () => ({
  oncreate(vnode) {
    chart = new Chartist.Bar('.ct-chart', vnode.attrs.data, getChartOptions());
  },
  view(vnode) {
    const { data } = vnode.attrs;
    if (chart && data) {
      let guessedDateFormat;
      if (data.series && data.series.length > 0) {
        const dataLength = data.series[0].data.length;
        guessedDateFormat = guessAxisFormatFromData(dataLength);
      }
      // update chart data and xAxis if needed
      chart.update(data, getChartOptions(guessedDateFormat));
    }

    return <div className="ct-chart ct-square"/>;
  },
});
