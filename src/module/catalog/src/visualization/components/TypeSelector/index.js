import m from 'mithril';
import './index.scss';

export default (vnode) => {
  return {
    view(vnode) {
      const { type, onSelect } = vnode.attrs;

      return (
          <div class="graphType__card__wrapper">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-secondary btn-raised active">
                <input type="radio" name="graphType" autocomplete="off"
                ></input>
                Map
              </label>
              <label class="btn btn-secondary btn-raised">
                <input type="radio" name="graphType" autocomplete="off"
                ></input>
                Bar Chart
              </label>
              <label class="btn btn-secondary btn-raised">
                <input type="radio" name="graphType" autocomplete="off"
                       checked
                ></input>
                Line Chart
              </label>
            </div>
          </div>
      );
    },
  };
};
