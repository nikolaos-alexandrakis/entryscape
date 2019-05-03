import { getDistributionFileEntries } from 'catalog/datasets/utils/distributionUtil';
import { chartURIToType, operationURIToType, parseCSVFile } from 'catalog/datasets/utils/visualizationUtil';
import escaVisualizationNLS from 'catalog/nls/escaVisualization.nls';
import VisualizationChart from 'catalog/visualization/components/VisualizationChart';
import { i18n } from 'esi18n';
import registry from 'commons/registry';
import m from 'mithril';

import './index.scss';

export default () => {
  let csvData;
  const updateCSVData = (data) => {
    csvData = data;
    m.redraw();
  };

  const getDefaultCSVFileEntry = fileEntries => fileEntries[0].getResourceURI();

  return {
    oninit(vnode) {
      const { configurationEntry } = vnode.attrs;
      const ruri = configurationEntry.getResourceURI();
      const md = configurationEntry.getMetadata();

      const distributionRURI = md.findFirstValue(ruri, 'dcterms:source');
      registry.getEntryStoreUtil()
        .getEntryByResourceURI(distributionRURI)
        .then(getDistributionFileEntries)
        .then(getDefaultCSVFileEntry)
        .then(parseCSVFile)
        .then(updateCSVData)
        .catch((err) => {
          console.log('could not get CSV file');
        });
    },
    view(vnode) {
      const { configurationEntry, header } = vnode.attrs;
      const ruri = configurationEntry.getResourceURI();
      const md = configurationEntry.getMetadata();

      const chartTypeURI = md.findFirstValue(ruri, 'store:style');
      const chartType = chartURIToType(chartTypeURI);
      const xAxisField = md.findFirstValue(ruri, 'store:x');
      const yAxisField = md.findFirstValue(ruri, 'store:y');
      const operationURI = md.findFirstValue(ruri, 'store:operation');
      const operation = operationURIToType(operationURI);

      const escaVisualization = i18n.getLocalization(escaVisualizationNLS);

      return <div className="chart--wrapper">
        {header}
        <div className="Chart">
          <div className="no-data">{escaVisualization.vizNoData}</div>
          {csvData ? <VisualizationChart
            name={name}
            type={chartType}
            xAxisField={xAxisField}
            yAxisField={yAxisField}
            operation={operation}
            data={csvData}/> : null}
        </div>
      </div>;
    },
  };
};
