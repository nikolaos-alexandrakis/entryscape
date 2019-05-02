import m from 'mithril';
import { createSetState } from 'commons/util/util';
import GeoMap from 'commons/rdforms/choosers/components/Map';
import BarChartTime from 'catalog/statistics/components/BarChartTime';
import './index.scss';

export default (vnode) => {
  const renderChart = (chartType) => {
    const chartMap = new Map(Object.entries({
      map: (
        <GeoMap
          value={[
            'POINT(30 10)',
            'POINT(31 10)',
          ]}
        />
      ),
      bar: (
        <img
          src='https://i0.wp.com/m.signalvnoise.com/wp-content/uploads/2016/11/1Eq40iwcboRFBMF37oAaM7Q.png?zoom=1.25&resize=637%2C411&ssl=1'>
        </img>
      ),
    }));

    return chartMap.get(chartType);
  };
  const state = {
  };

  const setState = createSetState(state);

  return {
    view(vnode) {
      const { type } = vnode.attrs;

      return (
        <div>
          {renderChart(type)}
        </div>
      );
    },
  };
};
