import './index.scss';

export default (initialVnode) => {
  const { onSelect } = initialVnode.attrs;

  const selected = {
    x: null,
    y: null,
    operation: null,
  };

  const updateX = (e) => {
    selected.x = e.target.value;
    onSelect(selected);
  };
  const updateY = (e) => {
    selected.y = e.target.value;
    onSelect(selected);
  };
  const updateOperation = (e) => {
    selected.operation = e.target.value;
    onSelect(selected);
  };

  return {
    view(vnode) {
      const { x, y, operation, fields, type } = vnode.attrs;
      selected.x = x;
      selected.y = y;
      selected.operation = operation;
      return (
        <div class="axisOptions__wrapper">
          <div class="axisX__wrapper">
            <h5>{type === 'map' ? 'Longitude' : 'X'}:</h5>
            <div class="form-group">
              <select class="form-control"
                value={x}
                onchange={updateX}
              >
                {fields ? fields.map(field => <option value={field}>{field}</option>) : null}
              </select>
            </div>
            {type !== 'map' && (
                <div class="form-group operations__wrapper">
                  <select class="form-control"
                    onchange={updateOperation}
                  >
                    <option value="none">none</option>
                    <option value="count">COUNT</option>
                    <option value="sum">SUM</option>
                  </select>
                </div>
            )}
          </div>
          {operation !== 'count' && (
            <div class="axisY__wrapper">
              <h5>{type === 'map' ? 'Latitude' : 'Y'}:</h5>
              <div class="form-group">
                <select class="form-control"
                  value={y}
                  onchange={updateY}
                >
                  {fields ? fields.map(field => <option disabled={field === selected.x} value={field}>{field}</option>) : null}
                </select>
              </div>
            </div>
          )}
        </div>
      );
    },
  };
};
