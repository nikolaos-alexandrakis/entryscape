import './index.scss';

/**
 * @param {function} callback
 * @param {Event} e
 */
const handleTabClick = (callback, e) => {
  const tab = e.currentTarget.dataset.tab;
  callback(tab);
};

export default () => ({
  view(vnode) {
    const { items, selected, onchangeTab } = vnode.attrs;
    const onclick = e => handleTabClick(onchangeTab, e);

    return (
      <div className="col-md-12">
        <ul className="entryscape__view__list__bottom list-inline">
          {items.map(item => <li
            key={item.id}
            onclick={onclick}
            className={item.id === selected ? 'selected' : ''}
            data-tab={item.id}>
            <a className="spaExplicitLink">
              <i className={`fa ${item.icon}`}/>
              <span>{item.label}</span>
            </a>
          </li>)}
        </ul>
      </div>
    );
  },
});
