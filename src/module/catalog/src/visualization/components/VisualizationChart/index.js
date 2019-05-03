import m from 'mithril';
import GeoMap from 'commons/rdforms/choosers/components/Map';
import BarChart from 'catalog/visualization/components/BarChart';
import './index.scss';

export default (vnode) => {
  const processGeoData = (data, xField, yField) => {
    const parsedGeoData = data ? data.data.map(row => row[xField] ? `POINT(${row[xField]} ${row[yField]})` : null).filter(point => point !== null) : null;

    return parsedGeoData;
  };

  const processXYData = (datasets, xField, yField) => {
    if (Array.isArray(dataset)) {
      return datasets.map( dataset => processXYDataset(dataset, xField, yField) );
    }
    else {
      return [processXYDataset(datasets, xField, yField)];
    }
  };

  const processXYDataset = (data, xField, yField) => {
    // const labels = [xField, yField];
    const transpose = matrix => Object.keys(matrix[0])
      .map(colNumber => matrix.map(rowNumber => rowNumber[colNumber]));

    const [xLabels, yData] = transpose(
      data.data.map(row => ([row[xField], row[yField]]))
    );

    return {
      xLabels,
      yData,
    };
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
      case 'bar':
        processedData = processXYData(data, xAxisField, yAxisField);
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
        <BarChart
          data={processedData}
        />
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
