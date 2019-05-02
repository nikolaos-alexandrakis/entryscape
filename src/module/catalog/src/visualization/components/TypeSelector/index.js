import m from 'mithril';
import './index.scss';

export default (vnode) => {
  const { onSelect } = vnode.attrs;

  const selectMap = () => {
    onSelect('map');
  };
  const selectBar = () => {
    onSelect('bar');
  };
  const selectLine = () => {
    onSelect('line');
  };

  return {
    view(vnode) {
      const { type } = vnode.attrs;

      return (
          <div class="graphType__card__wrapper">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-secondary btn-raised active">
                <input type="radio" name="graphType"
                  onchange={selectMap}
                ></input>
                Map
              </label>
              <label class="btn btn-secondary btn-raised">
                <input type="radio" name="graphType"
                  onchange={selectBar}
                ></input>
                Bar Chart
              </label>
              <label class="btn btn-secondary btn-raised">
                <input type="radio" name="graphType"
                  onchange={selectLine} checked="checked" data-blah="heya"
                ></input>
                Line Chart
              </label>
            </div>
          </div>
      );
    },
  };
};
