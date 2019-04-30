import { getUploadedDistributionEntries } from 'catalog/datasets/utils/datasetUtil';
import { getDistributionFileEntries } from 'catalog/datasets/utils/distributionUtil';
import escaVisualization from 'catalog/nls/escaVisualization.nls';
import TitleDialog from 'commons/dialog/TitleDialog';
import { getEntryRenderName } from "commons/util/entryUtil";
import { createSetState } from 'commons/util/util';
import declare from 'dojo/_base/declare';
import Papa from 'papaparse';

const parseCSVFile = (info, callback) => {
  const complete = data => callback({ info, data });
  Papa.parse(info.uri, {
    download: true,
    header: true,
    complete,
  });
};

const getCSVFiles = async (datasetEntry, callback) => {
  const distEntries = await getUploadedDistributionEntries(datasetEntry, ['text/csv']);
  const csvFilePromises = distEntries.map(getDistributionFileEntries);

  for await (const csvFileEntries of csvFilePromises) { // eslint-disable-line
    csvFileEntries.forEach((csvFileEntry) => {
      const csvFileRURI = csvFileEntry.getResourceURI();
      const fileName = getEntryRenderName(csvFileEntry);
      console.log(fileName);
      parseCSVFile({
        uri: csvFileRURI,
        datasetName: 'dataset 1',
        fileName,
      }, callback);
    });
  }
};

const getControllerComponent = (datasetEntry) => {
  const state = {
    files: [],
  };

  const setState = createSetState(state);

  const updateCSVData = ({ info, data }) => {
    const { uri, datasetName, fileName } = info;
    const files = state.files;

    files.push({
      uri,
      datasetName,
      fileName,
      headers: data.meta.fields,
    });
    setState({ files });
  };

  return {
    oninit() {
      setState({ files: [] });
      getCSVFiles(datasetEntry, updateCSVData); // promise callbacked
    },
    view() {
      return <section>
        Start creating your viz!
        <ul>
          {state.files.map(file => <li>
            <span>Dataset name : {file.datasetName}</span>
            <span>File name : {file.fileName}</span>
            <span>Headers : {file.headers.join()}</span>
          </li>)}
        </ul>

      </section>;
    },
  };
};


export default declare([TitleDialog.ContentComponent], {
  nlsBundles: [{ escaVisualization }],
  nlsHeaderTitle: 'vizDialogTitle',
  nlsFooterButtonLabel: 'vizDialogFooter',
  open(params) {
    const { entry: datasetEntry } = params;
    this.dialog.show();
    const controllerComponent = getControllerComponent(datasetEntry);
    this.show(controllerComponent);
  },
});
