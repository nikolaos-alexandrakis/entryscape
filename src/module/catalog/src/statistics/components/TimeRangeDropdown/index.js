import './index.scss';

export default () => ({
  view(vnode) {
    const { items, selected, onclick } = vnode.attrs;
    const selectedItem = items.find(item => item.id === selected);
    return (
      <div className="btn-group btn-group--chooser">
        <a className="btn btn-secondary dropdown-toggle" data-toggle="dropdown">
          {selectedItem.name}
          <span className="caret" style={{ marginLeft: '15px' }}></span>
        </a>
        <ul className="dropdown-menu">
          {items.map((item) => {
            if (item.id === '-') {
              return <li className="dropdown-divider"/>;
            }
            return <li className={`${selected === item.id ? 'active' : ''} dropdown-item`} data-range={item.id} onclick={onclick}>
              <a>{item.name}</a>
            </li>;
          })}
        </ul>
      </div>
    );
  },
});
