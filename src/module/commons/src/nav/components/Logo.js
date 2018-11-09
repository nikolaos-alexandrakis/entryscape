import m from 'mithril';
import Icon from './logo/IconLogo';
import Full from './logo/FullLogo';

export default {
  view(vnode) {
    const { type } = vnode.attrs;

    switch (type) {
      case 'icon': // only icon and text provided
        return m(Icon, vnode.attrs);
      case 'full': // full logo provided
        return m(Full, vnode.attrs);
      default: // both icon and full logo provided
        break;
    }

    return [m(Full, vnode.attrs), m(Icon, vnode.attrs)];
  },
};
