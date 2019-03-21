import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { i18n } from 'esi18n';
import './index.scss';

export default () => ({
  view(vnode) {
    /**
     * @todo fix jsdoc
     * @type {{items: []}}
     */
    const { items, filteredItems, selected, onclick } = vnode.attrs;
    const toRenderItems = filteredItems || items;
    const hasData = !!toRenderItems.length > 0;


    const escaStatisticsNLS = i18n.getLocalization(escaStatistics);

    return hasData ?
      (<div class="stats__row__wrapper--file">
        <div className="stats-header">
          <span className="distribution__head__title">{escaStatisticsNLS.tabHeaderTitle}</span>
          <div className="flex header--wrapper--right">
            <span className="distribution__head__title">{escaStatisticsNLS.abHeaderFormat}</span>
            <span title= {escaStatisticsNLS.rowHeaderFile} className="distribution__head__title fa fa-download"></span>
          </div>
        </div>
        {toRenderItems.map(item =>
          <div key={item.uri} onclick={onclick} tabIndex="0" data-uri={item.uri}
               className={`stats__row flex--sb ${item.uri === selected ? 'selected' : ''}`}>
            <div className="row__title--wrapper">
              <span className="row__title">{item.name}</span>
              {item.subname ?
                <span className="row__text">{item.subname}</span> :
                null
              }
              {item.filename ?
                <span className="row__text">
                    <i className="fa fa-file"/>
                    <span>{item.filename}</span>
                  </span> :
                null
              }
            </div>
            <div className="flex--sb row--right--wrapper">
              <span className="row__text">{item.format}</span>
              <span className="row__text stat__count">{item.count}</span>
            </div>
          </div>)}
      </div>) :
      (<div className="no-data">{escaStatisticsNLS.imeRangeNoDataAvailable}</div>);
  },
});
