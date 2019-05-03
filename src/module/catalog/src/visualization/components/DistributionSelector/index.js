import { i18n } from 'esi18n';
import escaVisualizationNLS from 'catalog/nls/escaVisualization.nls';
import './index.scss';

export default () => {
  return {
    view(vnode) {
      const { onChangeSelectedFile, files } = vnode.attrs;
      const escaVisualization = i18n.getLocalization(escaVisualizationNLS);


      return (
        <div class="useFile__wrapper">
          <h5>{escaVisualization.vizDialogDistributionUse}</h5>
          <div class="form-group">
            <select className="form-control" onchange={onChangeSelectedFile}>
              {files && files.map(file => <option value={file.uri}>{file.distributionName} - {file.fileName}</option>)}
            </select>
          </div>
        </div>
      );
    },
  };
};
