import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { i18n } from 'esi18n';

export default () => {
  let handleSearchUpdate;
  return {
    oninit(vnode) {
      const { onchangeSearch } = vnode.attrs;
      handleSearchUpdate = (evt) => {
        const value = evt.target.value;
        onchangeSearch(value);
      };
    },
    view() {
      const placeholder = i18n.localize(escaStatistics, 'statsSearchInputPlaceholder');
      return (<div className="form-group input-group col-md-8">
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          onchange={handleSearchUpdate}
          onkeyup={handleSearchUpdate}/>
        <span className="input-group-btn">
          <button className="btn btn-default searchButton" type="button" title="" aria-label="Search">
            <span className="screenreader__span"/>
            <span className="fa fa-search" aria-hidden="true"/>
          </button>
        </span>
      </div>);
    },
  };
};
