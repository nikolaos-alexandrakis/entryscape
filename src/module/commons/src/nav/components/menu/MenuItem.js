import { isExternalLink } from 'commons/util/util';

/**
 * Gets called when an item is clicked. Calls a callback with the data-module value of that clicked item
 *
 * @param {function} callback
 * @param {Event} e
 */
const callbackWrapper = (callback, e) => callback(e.currentTarget.dataset.module);

export default () => {
  let onMenuItemClick;
  return {
    oninit(vnode) {
      const { onclick } = vnode.attrs;
      // this is stored in this context in order to avoid binding in every view
      onMenuItemClick = callbackWrapper.bind(null, onclick);
    },
    view(vnode) {
      const { item: { name, label, href, icon }, selected } = vnode.attrs;

      return <li
        key={name}
        className={`${selected ? 'active' : ''}`}
        onclick={onMenuItemClick}
        data-module={name}>
        <a href={href} className={`${selected ? 'active' : ''}`}>
          <i className={`fas fa-${icon}`}/>
          <span className={'menu-title'}>{label}</span>
          {isExternalLink(href) ? <span className="fas fa-external-link-alt"/> : null}
        </a>
      </li>;
    },
  };
};
