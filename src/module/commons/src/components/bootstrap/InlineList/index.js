import './index.scss';

export default (vnode) => {
  return {
    view(vnode) {
      /**
       * @todo fix jsdoc
       * @type {{items: []}}
       */
      const { items, onclick, selected } = vnode.attrs;
      const tabs = items.map((item, idx) => {
        return <li onclick={onclick} className={idx === selected ? 'selected' : ''} data-tab={idx}>
          <a className="spaExplicitLink">
            <i className={`fa ${item.icon}`}></i>
            <span>{item.label}</span>
          </a>
        </li>;
      });

      return (
        <div className="col-md-12">
          <ul className="entryscape__view__list__bottom list-inline">
            {tabs}
          </ul>
        </div>
      );
    },
  };
};
