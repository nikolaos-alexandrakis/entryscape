import m from 'mithril';
import './index.scss';

export default (vnode) => {
  const { onSelect } = vnode.attrs;

  const selected = {
    x: null,
    y: null,
    operation: null,
  };

  const updateX = e => {
    selected.x = e.target.value;
    onSelect(selected);
  };
  const updateY = e => {
    selected.y = e.target.value;
    onSelect(selected);
  };
  const updateOperation = e => {
    selected.operation = e.target.value;
    onSelect(selected);
  };

  return {
    view(vnode) {
      const { x, y, operation, data } = vnode.attrs;
      selected.x = x;
      selected.y = y;
      selected.operation = operation;

      return (
        <div class="axisOptions__wrapper">
          <div class="axisX__wrapper">
            <h5>X:</h5>
            <div class="form-group">
              <select class="form-control"
                value={x}
                onchange={updateX}
              >
                {data ? data.meta.fields.map(field => <option value={field}>{field}</option>) : null}
              </select>
            </div>
            <div class="form-group operations__wrapper">
              <select class="form-control"
                onchange={updateOperation}
              >
                <option value="none">none</option>
                <option value="sum">SUM</option>
                <option value="count">COUNT</option>
              </select>
            </div>
          </div>
          <div class="axisY__wrapper">
            <h5>Y:</h5>
            <div class="form-group">
              <select class="form-control"
                value={y}
                onchange={updateY}
              >
                {data ? data.meta.fields.map(field => <option value={field}>{field}</option>) : null}
              </select>
            </div>
          </div>
        </div>
      );
    },
  };
};
