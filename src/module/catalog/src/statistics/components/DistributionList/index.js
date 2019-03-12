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
        <div class="stats-header">
          <p class="distribution__head__title">Title</p>
          <div class="flex header--wrapper--right">
            <p class="distribution__head__title">Format</p>
            <p class="distribution__head__title fa fa-download"></p>
          </div>
        </div>

        <div tabIndex="0" class="stats__row flex--sb">
          <div class="row__title--wrapper">
            <p class="row__title">{item.name}</p>
            <p class="row__text">{item.name}</p>
          </div>
          <div class="flex--sb row--right--wrapper">
            <span class="row__text">{item.format}</span>
            <span class="row__text">675</span>
          </div>
        </div>
      </div>) :
      (<div className="no-data">No data available data for the selected time range. <a>Try last month</a></div>);
  },
});
