import m from 'mithril';
export default (vnode) => ({
  view(vnode) {
    /**
     * @todo fix jsdoc
     * @type {{items: []}}
     */
    const { items, selected, onclick } = vnode.attrs;
    return (
      <div className="btn-group">
        <a className="btn btn-default">{items[selected]}</a>
        <a className="btn btn-default dropdown-toggle" data-toggle="dropdown">
          <span className="caret"></span>
        </a>
        <ul className="dropdown-menu">
          {items.map((item, idx) => {
            if (item === '-') {
              return <li className="divider"/>;
            }
            return <li className={selected === idx ? 'active' : ''} data-range={idx} onclick={onclick}>
              <a>{item}</a>
            </li>;
          })}
        </ul>
      </div>
    );
  },
});
