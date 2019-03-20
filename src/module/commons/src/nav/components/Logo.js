import m from 'mithril';
import Icon from './logo/IconLogo';
import Full from './logo/FullLogo';

export default {
  view(vnode) {
    const { type, src, text, isFooter } = vnode.attrs;

    switch (type) {
      case 'icon': // only icon and text provided
        return m(Icon, { type, src, text, isFooter });
      case 'full': // full logo provided
        return m(Full, { src });
      default: // both icon and full logo provided
        break;
    }

    return [m(Full, vnode.attrs), m(Icon, vnode.attrs)];
  },
};
