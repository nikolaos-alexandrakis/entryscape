import m from 'mithril';
import './index.scss';

export default (vnode) => {
  return {
    view(vnode) {
      const { hasData } = vnode.attrs;

      return (
        <div class="axisOptions__wrapper">
          <div class="axisX__wrapper">
            <h5>X:</h5>
            <div class="form-group">
              <select class="form-control">
                {hasData ? csvData.meta.fields.map(field => <option value={field}>{field}</option>) : null}
              </select>
            </div>
            <div class="form-group operations__wrapper">
              <select class="form-control">
                <option>SUM</option>
                <option>COUNT</option>
              </select>
            </div>
          </div>
          <div class="axisY__wrapper">
            <h5>Y:</h5>
            <div class="form-group">
              <select class="form-control">
                {hasData ? csvData.meta.fields.map(field => <option value={field}>{field}</option>) : null}
              </select>
            </div>
          </div>
        </div>
      );
    },
  };
};
