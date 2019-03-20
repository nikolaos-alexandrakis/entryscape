import escaStatistics from "catalog/nls/escaStatistics.nls";
import Chartist from 'chartist';
import 'chartist-plugin-legend';
import { i18n } from "esi18n";
import moment from 'moment'; // @todo valentino
import './index.scss';

let chart; // @todo @valentino

const getChartOptions = (xAxisDateFormat = 'MMM D', divisor = 31) => ({
  axisX: {
    offset: 20,
    type: Chartist.FixedScaleAxis,
    divisor,
    labelInterpolationFnc(value) {
      return moment(value).format(xAxisDateFormat);
    },
  },
  axisY: {
    type: Chartist.AutoScaleAxis,
    onlyInteger: true,
    offset: 10,
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
    let noData = true;
    if (chart && data) {
      let guessedDateFormat;
      let dataLength = 1;
      if (data.series && data.series.length > 0) {
        dataLength = data.series[0].data.length;
        guessedDateFormat = guessAxisFormatFromData(dataLength);
        noData = false;
      }
      // update chart data and xAxis if needed
      chart.update(data, getChartOptions(guessedDateFormat, dataLength - 1));
    }
    return (<div>
      <div className={`no-data ${noData ? '' : 'hidden'}`}>{i18n.localize(escaStatistics, 'timeRangeNoDataAvailable')}</div>
      <div className={`ct-chart ct-square ${noData ? 'hidden' : ''}`}/>
    </div>);
  },
});
