import Input from 'commons/components/common/form/Input';
import jquery from 'jquery';
import m from 'mithril';

export default {
  onupdate(vnode) {
    if (vnode.attrs.tooltip) {
      const label = jquery(vnode.dom).find('label')[0];
      jquery(label).tooltip();
    }
  },
  view(vnode) {
    const {
      type = 'togglebutton',
      label,
      tooltip,
      input,
    } = vnode.attrs;

    return m('.form-group', [
      m(`div.${type}`, [
        m('label', {
          'data-toggle': 'tooltip',
          'data-placement': 'right',
          'data-original-title': tooltip,
        }, [
          m(Input, { input }),
          m('span', label),
        ]),
      ]),
    ]);
  },
};

