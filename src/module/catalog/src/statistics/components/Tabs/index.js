import './index.scss';

export default () => ({
  view(vnode) {
    /**
     * @todo fix jsdoc
     * @type {{items: []}}
     */
    const { items, onclick, selected } = vnode.attrs;
    const tabs = items.map(item =>{
      const selectedClass = item.id === selected ? 'selected' : '';
      return (
        <li key={item.id} onclick={onclick} className={`${selectedClass} list-inline-item`} data-tab={item.id}>
          <a className="spaExplicitLink">
            <i className={`fa ${item.icon}`}/>
            <span>{item.label}</span>
          </a>
        </li>
      );
    });

    return (
      <div className="col-md-12">
        <ul className="entryscape__view__list__bottom list-inline">
          {tabs}
        </ul>
      </div>
    );
  },
});
