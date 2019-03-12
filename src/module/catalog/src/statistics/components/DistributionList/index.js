export default (vnode) => {
  return {
    view(vnode) {
      const { items = [] } = vnode.attrs;
      /**
       * @todo fix jsdoc
       * @type {{items: []}}
       */

      const hasData = !!items.length > 0;
      return hasData ?
        (<div>
          <div className="header">
            <div className="distribution__head__title">head1</div>
            <div className="distribution__head__title">head2</div>
            <div className="distribution__head__title">head3</div>
          </div>
          {items.map(item => (<div tabIndex="0" className="distribution__row flex--sb">
              <div className="distribution__format">
                <p className="distribution__title">{item.name}</p>
                <p className="file__format"><span className="file__format--short">{item.format}</span></p>
              </div>
              <div className="flex--sb"><span className="distribution__format">XML</span></div>
              <div className="flex--sb"><span className="distribution__format">{item.count}</span></div>
            </div>
          ))}
        </div>) :
        (<div className="no-data">No data available data for the selected time range. <a>Try last month</a></div>)
    },
  };
};
