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
            <label class="btn btn-secondary btn-raised graphCard active">
              <input type="radio" name="graphType"
                onchange={selectMap}
              ></input>
              <span class="fas fa-map-marked"></span>
               Map
            </label>
            <label class="btn btn-secondary btn-raised graphCard">
              <input type="radio" name="graphType"
                onchange={selectBar}
              ></input>
              <span class="fas fa-chart-bar"></span>
                Bar Chart
            </label>
            <label class="btn btn-secondary btn-raised graphCard">
              <input type="radio" name="graphType"
                onchange={selectLine} checked="checked" data-blah="heya"
              ></input>
                 <span class="fas fa-chart-line"></span>

                Line Chart
            </label>
          </div>
        </div>
      );
    },
  };
};
