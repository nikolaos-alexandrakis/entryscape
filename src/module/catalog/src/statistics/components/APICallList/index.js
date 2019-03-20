import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { i18n } from 'esi18n';
import './index.scss';

export default () => ({
  view(vnode) {
    const { items, filteredItems, selected, onclick } = vnode.attrs;
    const toRenderItems = filteredItems || items;
    const hasData = !!toRenderItems.length > 0;

    return hasData ?
      (<div class="stats__row__wrapper--API">
        <div className="stats-header">
          <p className="distribution__head__title">{i18n.localize(escaStatistics, 'tabHeaderTitle')}</p>
          <div className="flex header--wrapper--right">
            <p className="distribution__head__title fa fa-retweet"></p>
          </div>
        </div>
        {toRenderItems.map(item => (
          <div key={item.uri} onclick={onclick} tabIndex="0" data-uri={item.uri}
               className={`stats__row--API flex--sb ${item.uri === selected ? 'selected' : ''}`}>
            <div className="row__title--wrapper">
              <span className="row__title">{item.name}</span>
              <span className="row__text">{item.subname}</span>
            </div>
            <div className="flex--sb row--right--wrapper">
              <span className="row__text stat__count">{item.count}</span>
            </div>
          </div>))}
      </div>) :
      (<div className="no-data">{i18n.localize(escaStatistics, 'timeRangeNoDataAvailable')}</div>);
  },
});

