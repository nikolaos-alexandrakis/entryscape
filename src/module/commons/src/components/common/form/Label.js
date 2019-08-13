import m from 'mithril';

/**
 * @see ./Label.md
 */
export default {
  /**
   */
  view(vnode) {
    const { text, forInput, classNames = ['col-form-label'] } = vnode.attrs.label;
    return m('label', { for: forInput, class: classNames.join(' ') }, text);
  },
};
