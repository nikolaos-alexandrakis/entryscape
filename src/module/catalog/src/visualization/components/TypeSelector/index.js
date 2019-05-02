import m from 'mithril';
import './index.scss';

export default (vnode) => {
  return {
    view(vnode) {
      const { type } = vnode.attrs;

      return (
          <div class="graphType__card__wrapper">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-secondary btn-raised active">
                <input type="radio" name="options" id="option1" autocomplete="off"
                       checked={type === 'map'}
                ></input>Map
              </label>
              <label class="btn btn-secondary btn-raised">
                <input type="radio" name="options" id="option2" autocomplete="off"
                       checked={type === 'bar'}
                ></input>Bar Chart
              </label>
              <label class="btn btn-secondary btn-raised">
                <input type="radio" name="options" id="option3" autocomplete="off"
                       checked={type === 'line'}
                ></input>Line Chart
              </label>
            </div>
          </div>
      );
    },
  };
};
