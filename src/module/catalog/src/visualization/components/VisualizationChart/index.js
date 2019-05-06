import { uniq } from 'lodash-es';
import GeoMap from 'commons/rdforms/choosers/components/Map';
import BarChart from 'catalog/visualization/components/BarChart';
import './index.scss';

  const cleanFalseRows = ({xLabels, yData}) => {
    if (
      (
        (xLabels[xLabels.size-1] == null)
        || (xLabels[xLabels.size-1] == '')
      )
      && (
        (yData[yData.size-1] !== 0)
        && (
          (yData[yData.size-1] == null)
          || (yData[yData.size-1] == '')
        )
      )
    ){
      xLabels.pop();
      yData.pop();
    }

    const xLabelsClean = xLabels.map(label => ((label == null) || (label == '')) ? 'No Label' : label);

    return {
      xLabels: xLabelsClean,
      yData,
    };
  };

const processSum = (dataset, xField, yField) => {
  const fields = uniq(dataset.data.map(row => row[xField]));
  const fieldMap = new Map(fields.map(field => ([field, null])));

  const csvData = dataset.data || dataset.csv.data;
  csvData.forEach(row =>
    fieldMap.set(row[xField], (fieldMap.get(row[xField]) ? fieldMap.get(row[xField]) : 0) + parseFloat(row[yField])));
  const countedFields = [Array.from(fieldMap.keys()), Array.from(fieldMap.values())];

  return cleanFalseRows({
    xLabels: countedFields[0],
    yData: countedFields[1],
  });
};

const processCount = (dataset, xField, yField) => {
  const fieldMap = new Map();
  const csvData = dataset.data || dataset.csv.data;
  csvData.forEach(row =>
    fieldMap.set(row[xField], (fieldMap.get(row[xField]) ? fieldMap.get(row[xField]) : 0) + 1));
  const countedFields = [Array.from(fieldMap.keys()), Array.from(fieldMap.values())];

  return cleanFalseRows({
    xLabels: countedFields[0],
    yData: countedFields[1],
  });
};

export default () => {

  const processGeoData = (data, xField, yField) => {
    const parsedGeoData = data ? data.data.map(row => row[xField] ? `POINT(${row[xField]} ${row[yField]})` : null).filter(point => point !== null) : null;

    return parsedGeoData;
  };

  const processXYData = (datasets, xField, yField, operation) => {
    if (operation === 'sum') {
      // Needs to support multiple datasets
      if(Array.isArray(datasets)) {
        return datasets.map(dataset => processSum(dataset, dataset.xField, dataset.yField));
      }

      return [processSum(datasets, xField, yField)];
    }
    if (operation === 'count') {
      // Needs to support multiple datasets
      if(Array.isArray(datasets)) {

        return datasets.map(dataset => processCount(dataset, dataset.xField, dataset.yField));
      }

      return [processCount(datasets, xField)];
    }

    if (Array.isArray(datasets)) {
      return datasets.map((dataset) => {
        switch (dataset.operation) {
          case 'sum':
            return processSum(dataset, dataset.xField, dataset.yField);
          case 'count':
            return processCount(dataset, dataset.xField, dataset.yField);
          default:
            return processXYDataset(dataset, dataset.xField, dataset.yField);
        }
      });
    }

    return [processXYDataset(datasets, xField, yField)];
  };

  const processXYDataset = (data, xField, yField) => {
    const transpose = matrix => Object.keys(matrix[0])
      .map(colNumber => matrix.map(rowNumber => rowNumber[colNumber]));

    //

    const csvData = data.data || data.csv.data;
    const [xLabels, yData] = transpose(
      csvData.map(row => ([row[xField], row[yField]])),
    );

    return cleanFalseRows({
      xLabels,
      yData,
    });
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
      case 'line':
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
          type="bar"
        />
      ),
      line: (
        <BarChart
          data={processedData}
          type="line"
        />
      ),
    }));

    return chartMap.get(type);
  };

  return {
    view(vnode) {

      return (
        <div class="chart--size">
          {renderChart(vnode.attrs)}
        </div>
      );
    },
  };
};
