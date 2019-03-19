import Chartist from 'chartist';
import 'chartist-plugin-legend';
import moment from 'moment'; // @todo valentino

let chart; // @todo @valentino

/**
 * @todo @valentino
 *  nls
 */

const getChartOptions = (xAxisDateFormat = 'MMM D', divisor = 31) => ({
  axisX: {
    type: Chartist.FixedScaleAxis,
    divisor,
    labelInterpolationFnc(value) {
      return moment(value).format(xAxisDateFormat);
    },
  },
});

const guessAxisFormatFromData = (dataLength) => {
  let xAxisDateFormat = 'MMM D';
  if (dataLength < 13) {
    xAxisDateFormat = 'MMM';
  } else if (dataLength < 25) {
    xAxisDateFormat = 'H';
  } else if (dataLength < 32) {
    xAxisDateFormat = 'D';
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
      let dataLength = 1;
      if (data.series && data.series.length > 0) {
        dataLength = data.series[0].data.length;
        console.log(dataLength);
        guessedDateFormat = guessAxisFormatFromData(dataLength);
      }
      // update chart data and xAxis if needed
      console.log(data);
      chart.update(data, getChartOptions(guessedDateFormat, dataLength - 1));
    }

    return <div className="ct-chart"/>;
  },
});
