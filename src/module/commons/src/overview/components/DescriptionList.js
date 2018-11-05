import DescriptionInfo from './DescriptionInfo';
import m from 'mithril';

/**
 * HTML Description List
 *
 * @type {{sList: Array, view: ((vnode))}}
 */
const DescriptionList = {
  view(vnode) {
    const vnodeList = [];
    vnode.attrs.sList.forEach((item) => {
      const { label, value } = item;
      vnodeList.push(m(DescriptionInfo, { label, value }));
    });

    return m('dl', vnodeList);
  },
};

export {DescriptionList};
export default DescriptionList;
