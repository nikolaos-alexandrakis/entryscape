import m from 'mithril';

  /**
   * HTML: dt - dl
   */
const DescriptionInfo = {
  view(vnode) {
    return [
      m('dt', vnode.attrs.label),
      m('dd', vnode.attrs.value),
    ];
  },
};

export {DescriptionInfo};
export default DescriptionInfo;
