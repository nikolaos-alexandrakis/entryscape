import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { i18n } from 'esi18n';
import './index.scss';

/**
 * Call the parent callback with the dataset attributes
 *
 * @param {function} callback
 * @param {Event} e
 */
const onclickListItem = (callback, e) => callback({ ...e.currentTarget.dataset });

export default () => ({
  oninit(vnode) {
    this.handleListItemClick = onclickListItem.bind(null, vnode.attrs.onclick);
  },
  onbeforeupdate(vnode, old) {
    // make sure not to stop data flow, if new onclick is passed then update the callback
    if (vnode.attrs.onclick !== old.attrs.onclick) {
      this.handleListItemClick = onclickListItem.bind(null, vnode.attrs.onclick);
    }
  },
  view(vnode) {
    const { items, filteredItems, selected } = vnode.attrs;
    const toRenderItems = filteredItems || items;
    const hasData = !!toRenderItems.length > 0;

    return hasData ?
      (<div class="stats__row__wrapper--API">
        <div className="stats-header">
          <span className="distribution__head__title">{i18n.localize(escaStatistics, 'tabHeaderTitle')}</span>
          <div className="flex header--wrapper--right">
            <span
              title={i18n.localize(escaStatistics, 'rowHeaderAPI')}
              className="distribution__head__title fa fas-cogs">
            </span>
          </div>
        </div>
        {toRenderItems.map(item => (
          <div
            key={item.uri}
            onclick={this.handleListItemClick}
            tabIndex="0"
            data-uri={item.uri}
            data-name={item.name || item.subname}
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

