import m from 'mithril';
import Input from './Input';
import InputHelp from './InputHelp';
import Label from './Label';

/**
 * @type {{view: ((vnode))}}
 */
const FormGroup = {
  enabled: true,
  onbeforeupdate(vnode, old) {
    if (old.dom && old.dom.classList.contains('is-focused')) {
      vnode.attrs.classNames = vnode.attrs.classNames || [];
      vnode.attrs.classNames.push('is-focused');
    }
  },
  view(vnode) {
    const {
      label,
      input,
      help,
      classNames = [],
    } = vnode.attrs;

    const attrs = {
      class: classNames.join(' '),
    };
    if (!this.enabled) {
      attrs['disabled'] = 'disabled';
      input['disabled'] = 'disabled';
    }

    return m(`.form-group`, attrs, [
      m(Label, {label}),
      m('div', [
        m(Input, {input}),
        m(InputHelp, {help}),
      ]),
    ]);
  },
};

export default FormGroup;
