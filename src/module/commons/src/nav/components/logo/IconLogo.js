import m from 'mithril';

export default {
  view(vnode) {
    const { type, src: { icon }, text, isFooter = false } = vnode.attrs;

    const classes = ['logo-text', 'icon-text'];
    if (type !== 'icon') { // we are rendering both full and icon logo
      classes.push('hidden-md', 'hidden-lg hidden-xl');
    }
    if (isFooter) {
      classes.push('footer-logo-text');
    }

    return m('div', { class: classes.join(' ') }, [
      m('img', { src: icon, alt: 'logo image' }),
      text ? m('span.hidden-sm-down', text) : null,
    ]);
  },
};
