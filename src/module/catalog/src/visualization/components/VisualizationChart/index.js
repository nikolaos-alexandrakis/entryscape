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
  const csvData = dataset.data || dataset.csv.data;
  const fields = uniq(csvData.map(row => row[xField]));
  const fieldMap = new Map(fields.map(field => ([field, null])));

  csvData.forEach(row =>
    fieldMap.set(row[xField], (fieldMap.get(row[xField]) ? fieldMap.get(row[xField]) : 0) + parseFloat(row[yField])));
  const countedFields = [Array.from(fieldMap.keys()), Array.from(fieldMap.values())];

  const cleaned = cleanFalseRows({
    xLabels: countedFields[0],
    yData: countedFields[1],
  });

  return {
    ...cleaned,
    label: dataset.label,
  };
};

const processCount = (dataset, xField, yField) => {
  const fieldMap = new Map();
  const csvData = dataset.data || dataset.csv.data;
  csvData.forEach(row =>
    fieldMap.set(row[xField], (fieldMap.get(row[xField]) ? fieldMap.get(row[xField]) : 0) + 1));
  const countedFields = [Array.from(fieldMap.keys()), Array.from(fieldMap.values())];

  const cleaned = cleanFalseRows({
    xLabels: countedFields[0],
    yData: countedFields[1],
  });

  return {
    ...cleaned,
    label: dataset.label,
  };
};

const processGeoData = (data, xField, yField) => {
  if (Array.isArray(data)) {
    // const cleanGeoCSVDatas = data.map(mapData => mapData.csv.data.filter(row => (
      // (row[mapData.xField] && parseFloat(row[mapData.yField])) === false
    // )));

    // const parsedGeoDatas = cleanGeoDatas.map(mapData => mapData.csv.data.map(row => (row[mapData.xField] && row[mapData.yField]) ? `POINT(${row[mapData.xField]} ${row[mapData.yField]})` : null).filter(point => point !== null));
    const parsedGeoDatas = data.map(mapData => mapData.csv.data.map(row => (parseFloat(row[mapData.xField]) && parseFloat(row[mapData.yField])) ? `POINT(${row[mapData.xField]} ${row[mapData.yField]})` : null).filter(point => point !== null));

    return parsedGeoDatas;
  }
  const parsedGeoData = data ? data.data.map(row => (row[xField] && row[yField]) ? `POINT(${parseFloat(row[xField])} ${parseFloat(row[yField])})` : null).filter(point => point !== null) : null;

  return parsedGeoData;
};

export default () => {

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

    const cleaned = cleanFalseRows({
      xLabels,
      yData,
    });

    return {
      ...cleaned,
      label: data.label,
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

    const displayLegend = Array.isArray(data);
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
          displayLegend={displayLegend}
          type="bar"
        />
      ),
      line: (
        <BarChart
          data={processedData}
          displayLegend={displayLegend}
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
