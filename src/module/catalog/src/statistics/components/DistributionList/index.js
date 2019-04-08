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
            <span className="distribution__head__title">{escaStatisticsNLS.tabHeaderFormat}</span>
            <span title= {escaStatisticsNLS.rowHeaderFile} className="distribution__head__title fa fa-download"></span>
          </div>
        </div>
        { hasData ? toRenderItems.map(item =>
          <div key={item.uri} onclick={onclick} tabIndex="0" data-uri={item.uri}
            className={`stats__row flex--sb ${item.uri === selected ? 'selected' : ''}`}>
            <div className="row__title--wrapper">
            {item.filename ?
                <span className="row__title">
                  <i className="fa fa-file"/>
                  <span>{item.filename}</span>
                </span> :
                null
              }
              <span className="row__text">{escaStatisticsNLS.datasetPrefix} {item.name}</span>
              {item.subname ?
                <span className="row__text">{escaStatisticsNLS.distributionPrefix} {item.subname}</span> :
                null
              }
            </div>
            <div className="flex--sb row--right--wrapper">
              <span className="row__text label" data-format={item.format} title={item.format}>{item.abbrevFormat || item.format}</span>
              <span className="row__text stat__count">{item.count}</span>
            </div>
          </div>) :
          <div className="no-data">{escaStatisticsNLS.timeRangeNoDataAvailable}</div>
        }
      </div>) :
      (<div className="no-data">{escaStatisticsNLS.timeRangeNoDataAvailable}</div>);
  },
});
