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
    view(vnode) {
      const { placeholder, columnWidth = 'col-md-8' } = vnode.attrs;

      return (<div className={`form-group input-group ${columnWidth}`}>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          onchange={handleSearchUpdate}
          onkeyup={handleSearchUpdate}/>
        <span className="input-group-btn">
          <button className="btn btn-secondary searchButton" type="button" title="" aria-label="Search">
            <span className="screenreader__span"/>
            <span className="fas fa-search" aria-hidden="true"/>
          </button>
        </span>
      </div>);
    },
  };
};
