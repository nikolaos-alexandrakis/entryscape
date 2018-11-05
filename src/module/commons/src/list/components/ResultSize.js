import m from 'mithril';

export default {
  view(vnode) {
    const {text} = vnode.attrs;
    return m('div.esco__resultSize', {title: `${text}`}, `${text}`);
  },
};
