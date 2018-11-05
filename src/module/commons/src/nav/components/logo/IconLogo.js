import m from 'mithril';

const IconLogo = {
  view(vnode) {
    const {type, src: {icon}, text, isFooter = false} = vnode.attrs;

    let classes = []
    if (!isFooter) {
      classes.push('logo-text', 'icon-text')
      if (type !== 'icon') { // we are rendering both full and icon logo
        classes.push('hidden-md', 'hidden-lg hidden-xl');
      }
    }

    return m('div', {class: classes.join(' ')}, [
      m('img', {src: icon, alt: 'logo image'}),
      text ? m('span.hidden-sm-down', text) : null,
    ]);
  },
};

export default IconLogo;
