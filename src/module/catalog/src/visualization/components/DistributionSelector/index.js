import m from 'mithril';
import './index.scss';

export default (vnode) => {

  return {
    view(vnode) {
      const {onChangeSelectedFile, files } = vnode.attrs;

      return (
        <div class="useFile__wrapper">
          <h5>You are using this file:</h5>
          <div class="form-group">
            <select className="form-control" onchange={onChangeSelectedFile}>
              {files.map(file => <option value={file.uri}>{file.distributionName} - {file.fileName}</option>)}
            </select>
          </div>
        </div>
      );
    },
  };
};
