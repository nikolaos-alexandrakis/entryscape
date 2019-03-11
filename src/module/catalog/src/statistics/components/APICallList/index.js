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
        </div>
        <div tabIndex="0" className="distribution__row flex--sb">
          <div className="distribution__format"><p className="distribution__title">Best API</p></div>
          <div className="flex--sb"><span className="distribution__format">675</span></div>
        </div>
      </div>
    );
  },
});
