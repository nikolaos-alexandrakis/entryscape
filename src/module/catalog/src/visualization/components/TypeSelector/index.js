import m from 'mithril';
import { i18n } from 'esi18n';
import escaVisualizationNLS from 'catalog/nls/escaVisualization.nls';
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
      const escaVisualization = i18n.getLocalization(escaVisualizationNLS);

      return (
        <div class="graphType__card__wrapper">
          <div class="btn-group btn-group-toggle" data-toggle="buttons">
            <label class={`btn btn-secondary btn-raised graphCard ${type == 'map' && 'active'}`}>
              <input
                type="radio"
                name="graphType"
                value="map"
                onchange={selectMap}
              ></input>
              <span class="fas fa-map-marked"></span>
               {escaVisualization.vizGraphMap}
            </label>
            <label class={`btn btn-secondary btn-raised graphCard ${type == 'bar' && 'active'}`}>
              <input
                type="radio"
                name="graphType"
                value="bar"
                onchange={selectBar}
              ></input>
              <span class="fas fa-chart-bar"></span>
              {escaVisualization.vizGraphBar}
            </label>
            <label class={`btn btn-secondary btn-raised graphCard ${type == 'line' && 'active'}`}>
              <input
                type="radio"
                name="graphType"
                value="line"
                onchange={selectLine}
              ></input>
                 <span class="fas fa-chart-line"></span>
                 {escaVisualization.vizGraphLine}
            </label>
          </div>
        </div>
      );
    },
  };
};
