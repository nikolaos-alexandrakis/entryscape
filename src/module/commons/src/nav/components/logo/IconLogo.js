import m from 'mithril';
import { i18n } from 'esi18n';
import escoLayoutNLS from 'commons/nls/escoLayout.nls';

export default () => ({
  view(vnode) {
    const { type, src: { icon }, text, isFooter = false } = vnode.attrs;

    const classes = ['logo-text', 'icon-text'];
    if (type !== 'icon') { // we are rendering both full and icon logo
      classes.push('d-md-none', 'd-lg-none d-xl-none');
    }
    if (isFooter) {
      classes.push('footer-logo-text');
    }

    const title = i18n.localize(escoLayoutNLS, 'goHomeLink');

    return m('div', { class: classes.join(' ') }, [
      m('img', {
        src: icon,
        alt: 'logo image',
        title,
      }),
      text ? m('span.d-sm-none-down', {
        title,
      }, text) : null,
    ]);
  },
});
