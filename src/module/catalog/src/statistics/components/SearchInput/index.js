import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { i18n } from 'esi18n';

export default () => ({
  view(vnode) {
    const { onchange, onkeyup } = vnode.attrs;
    return (<div className="input-group col-md-6">
      <input type="text" id="stats-search-input" className="form-control"
             placeholder={i18n.localize(escaStatistics, 'statsSearchInputPlaceholder')} onchange={onchange}
             onkeyup={onkeyup}/>
      <span className="input-group-btn">
        <button className="btn btn-secondary searchButton" type="button" title="" aria-label="Search">
          <span className="screenreader__span"></span>
          <span className="fa fa-search" aria-hidden="true"/>
        </button>
      </span>
    </div>);
  },
});
