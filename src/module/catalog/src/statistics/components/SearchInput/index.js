import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { i18n } from 'esi18n';

/**
 * @param {function} callback
 */
const handleSearchValueChange = (callback) => {
  const value = document.getElementById('stats-search-input').value;
  callback(value);
};

export default () => ({
  view(vnode) {
    const handleSearchUpdate = () => handleSearchValueChange(vnode.attrs.onchangeSearch);
    const placeholder = i18n.localize(escaStatistics, 'statsSearchInputPlaceholder');
    return (<div className="input-group col-md-6">
      <input
        id="stats-search-input"
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
});
