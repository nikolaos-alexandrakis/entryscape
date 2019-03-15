/**
 * @todo @valentino
 *  nls
 */

export default (vnode) => ({
  view(vnode) {
    const { onchange } = vnode.attrs;
    return (<div className="input-group col-md-9">
      <input type="text" className="form-control" placeholder="Search for resources..." onchange={onchange}/>
      <span className="input-group-btn">
        <button className="btn btn-default searchButton" type="button" title="" aria-label="Search">
          <span className="screenreader__span"></span>
          <span className="fa fa-search" aria-hidden="true"/>
        </button>
      </span>
    </div>);
  },
});
