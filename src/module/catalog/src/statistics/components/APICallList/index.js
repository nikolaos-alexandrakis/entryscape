import './index.scss';
/**
 * @todo @valentino
 *  nls
 */

export default (vnode) => ({
  view(vnode) {
    /**
     * @todo fix jsdoc
     * @type {{items: []}}
     */
    const { items } = vnode.attrs;
    const hasData = !!items.length > 0;

    return hasData ?
      (<div>
        <div className="stats-header">
          <p className="distribution__head__title">Title</p>
          <div className="flex header--wrapper--right">
            <p className="distribution__head__title">Format</p>
            <p className="distribution__head__title fa fa-retweet"></p>
          </div>
        </div>
        {items.map(item => (<div tabIndex="0" className="stats__row flex--sb">
          <div className="row__title--wrapper">
            <p className="row__title">{item.name}</p>
            <p className="row__text">{item.subname}</p>
          </div>
          <div className="flex--sb row--right--wrapper">
            <span className="row__text">{item.format}</span>
            <span className="row__text stat__count">{item.count}</span>
          </div>
        </div>))}
      </div>) :
      (<div className="no-data">No data available data for the selected time range. <a>Try last month</a></div>);
  },
});

