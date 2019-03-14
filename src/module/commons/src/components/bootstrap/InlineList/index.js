import './index.scss';

export default (vnode) => {
  return {
    view(vnode) {
      /**
       * @todo fix jsdoc
       * @type {{items: []}}
       */
      const { items, onclick, selected } = vnode.attrs;
      const tabs = items.map(item => (
        <li key={item.id} onclick={onclick} className={item.id === selected ? 'selected' : ''} data-tab={item.id}>
          <a className="spaExplicitLink">
            <i className={`fa ${item.icon}`}/>
            <span>{item.label}</span>
          </a>
        </li>));

      return (
        <div className="col-md-12">
          <input type="text" id="custom-date-start" className="hidden" />
          <input type="text" id="custom-date-end" className="hidden" />
          <ul className="entryscape__view__list__bottom list-inline">
            {tabs}
          </ul>
        </div>
      );
    },
  };
};
