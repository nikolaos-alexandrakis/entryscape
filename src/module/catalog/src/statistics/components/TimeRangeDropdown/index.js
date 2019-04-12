import './index.scss';

/**
 * @param {function} callback
 * @param {Event} e
 */
const handleTimeRangeClick = (callback, e) => callback(e.currentTarget.dataset.range);

export default () => ({
  view(vnode) {
    const { items, selected, onclickTimeRange } = vnode.attrs;
    const selectedItem = items.find(item => item.id === selected);
    const onclick = e => handleTimeRangeClick(onclickTimeRange, e);
    return (
      <div className="btn-group btn-group--chooser">
        <a className="btn btn-default dropdown-toggle" data-toggle="dropdown">
          {selectedItem.name}
          <span className="caret" style={{ marginLeft: '15px' }}/>
        </a>
        <ul className="dropdown-menu">
          {items.map((item) => {
            if (item.id === '-') {
              return <li className="divider"/>;
            }
            return (<li
              className={selected === item.id ? 'active' : ''}
              data-range={item.id}
              onclick={onclick}>
              <a>{item.name}</a>
            </li>);
          })}
        </ul>
      </div>
    );
  },
});
