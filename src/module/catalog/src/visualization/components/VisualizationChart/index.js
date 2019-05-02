import m from 'mithril';
import GeoMap from 'commons/rdforms/choosers/components/Map';
import BarChartTime from 'catalog/statistics/components/BarChartTime';
import './index.scss';

export default (vnode) => {
  const processGeoData = data => {
    return [
            'POINT(30 10)',
            'POINT(31 10)',
          ];
  };

  const renderChart = (chartOptions) => {
    const {
      type,
      xAxisField,
      yAxisField,
      operation,
      data,
    } = chartOptions;

    let processedData;
    switch(type) {
      case 'map':
        processedData = processGeoData(data, xAxisField, yAxisField);
        break;
      default:
        processedData = {};
    }

    const chartMap = new Map(Object.entries({
      map: (
        <GeoMap
          value={processedData}
        />
      ),
      bar: (
        <BarChartTime/>
      ),
    }));

    return chartMap.get(type);
  };

  return {
    view(vnode) {

      return (
        <div>
          {renderChart(vnode.attrs)}
        </div>
      );
    },
  };
};
