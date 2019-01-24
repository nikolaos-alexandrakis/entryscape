import m from 'mithril';
import StatBox from './StatBox';

export default {
  view(vnode) {
    return m('.row', vnode.attrs.bList.map((item) => {
      const { label, value, link } = item;
      return m(StatBox, {
        label,
        value,
        link,
      });
    }));
  },
};
