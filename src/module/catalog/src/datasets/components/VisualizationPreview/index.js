import { chartURIToType, operationURIToType, parseCSVFile } from 'catalog/datasets/utils/visualizationUtil';
import VisualizationChart from 'catalog/visualization/components/VisualizationChart';
import m from 'mithril';

import './index.scss';

export default () => {
  let csvData;
  const updateCSVData = (data) => {
    csvData = data;
    m.redraw();
  };


  return {
    oninit(vnode) {
      const { configurationEntry } = vnode.attrs;
      const ruri = configurationEntry.getResourceURI();
      const md = configurationEntry.getMetadata();

      const distributionRURI = md.findFirstValue(ruri, 'dcterms:source');

      parseCSVFile(distributionRURI).then(updateCSVData);
    },
    view(vnode) {
      const { configurationEntry, header } = vnode.attrs;
      const ruri = configurationEntry.getResourceURI();
      const md = configurationEntry.getMetadata();

      const chartTypeURI = md.findFirstValue(ruri, 'store:style');
      const chartType = chartURIToType(chartTypeURI);
      const xAxisField = md.findFirstValue(ruri, 'store:x');
      const yAxisField = md.findFirstValue(ruri, 'store:y');
      const oeprationURI = md.findFirstValue(ruri, 'store:operation');
      const operation = operationURIToType(oeprationURI);

      return <div className="chart--wrapper">
        {header}
        <div className="Chart">
          <VisualizationChart
            type={chartType}
            xAxisField={xAxisField}
            yAxisField={yAxisField}
            operation={operation}
            data={csvData}
          />
        </div>
      </div>;
    },
  };
};
