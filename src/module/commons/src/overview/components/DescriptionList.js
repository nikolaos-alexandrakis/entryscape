import m from 'mithril';
import DescriptionInfo from './DescriptionInfo';

/**
 * HTML Description List
 *
 * @type {{sList: Array, view: ((vnode))}}
 */
export default {
  view(vnode) {
    const vnodeList = [];
    vnode.attrs.sList.forEach((item) => {
      const { label, value } = item;
      vnodeList.push(m(DescriptionInfo, { label, value }));
    });

    return m('dl.catalog__status', vnodeList);
  },
};
