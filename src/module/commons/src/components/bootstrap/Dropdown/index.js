import './index.scss';

export default (vnode) => ({
  view(vnode) {
    /**
     * @todo fix jsdoc
     * @type {{items: []}}
     */
    const { items, selected, onclick } = vnode.attrs;
    const selectedItem = items.find(item => item.id === selected);
    return (
      <div className="btn-group btn-group--chooser">
        <a className="btn btn-default">{selectedItem.name}</a>
        <a className="btn btn-default dropdown-toggle" data-toggle="dropdown">
          <span className="caret"></span>
        </a>
        <ul className="dropdown-menu">
          {items.map((item) => {
            if (item.id === '-') {
              return <li className="divider"/>;
            }
            return <li className={selected === item.id ? 'active' : ''} data-range={item.id} onclick={onclick}>
              <a>{item.name}</a>
            </li>;
          })}
        </ul>
      </div>
    );
  },
});
