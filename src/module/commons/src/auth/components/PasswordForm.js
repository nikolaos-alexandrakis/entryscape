import FormGroup from 'commons/components/common/form/FormGroup';
import escoSignin from 'commons/nls/escoSignin.nls';
import config from 'config';
import { i18n } from 'esi18n';
import m from 'mithril';
import registry from '../../registry';
import Password from '../Password';

const passconfig = config.entrystore.password || {};

const prevent = (f, notify) => (e) => {
  e.stopPropagation();
  e.preventDefault();
  if (f) {
    f(e);
    notify();
  }
};
let idCounter = 0;
/**
 * @type {{view: ((vnode))}}
 */
export default (type, notify) => ({
  oninit() {
    this.id = idCounter;
    idCounter += 1;
  },
  view: (vnode) => {
    const id = vnode.state.id;
    let passwordPlaceholder;
    const bundle = i18n.getLocalization(escoSignin);
    switch (type) {
      case 'reset':
        passwordPlaceholder = bundle.resetToNewPasswordPlaceholder;
        break;
      case 'signup':
        passwordPlaceholder = bundle.newPasswordPlaceholder;
        break;
      default:
        passwordPlaceholder = bundle.resetToNewPasswordSignedInPlaceholder;
    }
    const inputPassword = {
      type: 'password',
      value: Password.password,
      oninput: prevent(evt => Password.setPassword(evt.currentTarget.value), notify),
      onchange: prevent(),
      onkeyup: prevent(),
      autocomplete: 'new-password',
      placeholder: passwordPlaceholder,
      id: `passw-${id}--input`,
    };
    const inputConfirm = {
      type: 'password',
      value: Password.confirm,
      oninput: prevent(evt => Password.setConfirm(evt.currentTarget.value), notify),
      onchange: prevent(),
      onkeyup: prevent(),
      autocomplete: 'new-password',
      placeholder: bundle.confirmPasswordPlaceholder,
      id: `passw--${id}--confirm`,
    };
    return m('div', {}, [
      m(FormGroup, {
        classNames: (Password.provided() ? Password.isValid() : true) ? [] : ['has-error'],
        label: {
          forInput: `passw--${id}--input`,
          text: type !== 'signup' ? bundle.resetToNewPassword : bundle.newPassword,
        },
        input: inputPassword,
        help: {
          // eslint-disable-next-line no-nested-ternary
          text: Password.toShort() ? bundle.tooShortPassword :
            (Password.isValid() ? '' : registry.get('localize')(passconfig.message) || ''),
        },
      }),
      m(FormGroup, {
        classNames: Password.confirmed() ? [] : ['has-error'],
        label: { text: bundle.confirmPassword, forInput: `passw-${id}--confirm` },
        input: inputConfirm,
        help: { text: Password.confirmed() ? '' : bundle.passwordMismatch },
      }),
    ]);
  },
});

