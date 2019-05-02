import m from 'mithril';
import GeoMap from 'commons/rdforms/choosers/components/Map';
import BarChartTime from 'catalog/statistics/components/BarChartTime';
import './index.scss';

export default (vnode) => {
  const processGeoData = data => ([
            'POINT(30 10)',
            'POINT(31 10)',
          ]);

  const renderChart = (chartType, data) => {
    const processedData = processGeoData(data);
    const chartMap = new Map(Object.entries({
      map: (
        <GeoMap
          value={processedData}
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

  return {
    view(vnode) {
      const { type, data } = vnode.attrs;

      return (
        <div>
          {renderChart(type, data)}
        </div>
      );
    },
  };
};
