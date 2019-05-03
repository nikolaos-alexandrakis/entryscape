import { uniq } from 'lodash-es';
import GeoMap from 'commons/rdforms/choosers/components/Map';
import BarChart from 'catalog/visualization/components/BarChart';
import './index.scss';

const processSum = (dataset, xField, yField) => {
  const fields = uniq(dataset.data.map(row => row[xField]));
  const fieldMap = new Map(fields.map(field => ([field, null])));

  dataset.data.forEach(row =>
    fieldMap.set(row[xField], (fieldMap.get(row[xField]) ? fieldMap.get(row[xField]) : 0) + parseFloat(row[yField])));
  const countedFields = [Array.from(fieldMap.keys()), Array.from(fieldMap.values())];

  return {
    xLabels: countedFields[0],
    yData: countedFields[1],
  };
};

const processCount = (dataset, xField, yField) => {
  const fieldMap = new Map();
  dataset.data.forEach(row =>
    fieldMap.set(row[xField], (fieldMap.get(row[xField]) ? fieldMap.get(row[xField]) : 0) + 1));
  const countedFields = [Array.from(fieldMap.keys()), Array.from(fieldMap.values())];

  return {
    xLabels: countedFields[0],
    yData: countedFields[1],
  };
};

export default () => {
  const processGeoData = (data, xField, yField) => {
    const parsedGeoData = data ? data.data.map(row => row[xField] ? `POINT(${row[xField]} ${row[yField]})` : null).filter(point => point !== null) : null;

    return parsedGeoData;
  };

  const processXYData = (datasets, xField, yField, operation) => {
    if (operation === 'sum') {
      // Needs to support multiple datasets
      return [processSum(datasets, xField, yField)];
    }
    if (operation === 'count') {
      // Needs to support multiple datasets
      return [processCount(datasets, xField)];
    }
    if (Array.isArray(dataset)) {
      return datasets.map(dataset => processXYDataset(dataset, xField, yField));
    }
    return [processXYDataset(datasets, xField, yField)];
  };

  const processXYDataset = (data, xField, yField) => {
    const transpose = matrix => Object.keys(matrix[0])
      .map(colNumber => matrix.map(rowNumber => rowNumber[colNumber]));

    const [xLabels, yData] = transpose(
      data.data.map(row => ([row[xField], row[yField]])),
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
        processedData = processGeoData(data, xAxisField, yAxisField, operation);
        break;
      case 'bar':
        processedData = processXYData(data, xAxisField, yAxisField, operation);
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
