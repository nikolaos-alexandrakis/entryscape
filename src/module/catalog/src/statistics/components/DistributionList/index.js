export default (vnode) => ({
  view(vnode) {
    /**
     * @todo fix jsdoc
     * @type {{items: []}}
     */
    const { items, selected, onclick } = vnode.attrs;
    return (
      <div>
        <div className="header">
          <div className="distribution__head__title">head1</div>
          <div className="distribution__head__title">head2</div>
          <div className="distribution__head__title">head3</div>
        </div>
        <div tabIndex="0" className="distribution__row flex--sb">
          <div className="distribution__format"><p className="distribution__title">Downloadable file</p><p
            className="file__format"><span className="file__format--short">application/octet-stream</span></p></div>
          <div className="flex--sb"><span className="distribution__format">XML</span></div>
          <div className="flex--sb"><span className="distribution__format">675</span></div>
        </div>
        <div tabIndex="0" className="distribution__row flex--sb">
          <div className="distribution__format"><p className="distribution__title">Downloadable file</p><p
            className="file__format"><span className="file__format--short">application/octet-stream</span></p></div>
          <div className="flex--sb"><p className="distribution__format">CSV</p></div>
          <div className="flex--sb"><p className="distribution__format">34</p></div>
        </div>
      </div>
    );
  },
});
