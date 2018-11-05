import m from 'mithril';
import './escoKeyValueComponent.css';
const bemBlock = 'keyvalue';
const bemElement = `${bemBlock}__item`;

/**
 * @see ./KeyValueList.md
 */
const KeyValueList = {
  /**
   * @param {Array} data - An array containing the list items
   */
  view(vnode) {
    const {data, dtClass = '', ddClass = '', asBadge = false} = vnode.attrs;

    return m('dl.dl-horizontal',
      Object.keys(data).map(key => m('div', {key: key.replace(/\s/g, '')}, [
        m('dt', {class: dtClass}, key),
        m('dd', {class: ddClass}, asBadge ? m('span.badge', data[key]) : data[key]),
      ])));
  },
};

export default KeyValueList;
