import m from 'mithril';
import './escoKeyValueComponent.css';

/**
 * @see ./KeyValueList.md
 */
export default {
  /**
   * @param {Array} data - An array containing the list items
   */
  view(vnode) {
    const { data, dtClass = '', ddClass = '', asBadge = false } = vnode.attrs;

    return m('dl.dl--horizontal',
      Object.keys(data).map(key => m('div', { key: key.replace(/\s/g, '') }, [
        m('dt', { class: dtClass }, key),
        m('dd', { class: ddClass }, asBadge ? m('span.badge badge-pill badge-primary', data[key]) : data[key]),
      ])));
  },
};
