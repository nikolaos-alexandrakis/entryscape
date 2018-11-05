import Password from '../Password';
import registry from '../../registry';
import FormGroup from 'commons/components/common/form/FormGroup';
import escoSignin from 'commons/nls/escoSignin.nls';
import {i18n} from 'esi18n';
import config from 'config';
import m from 'mithril';

const passconfig = config.entrystore.password || {};

let bundle;
registry.onChange('locale', () => {
  bundle = i18n.getLocalization(escoSignin);
  m.redraw();
}, true);

const prevent = (f, notify) => (e) => {
  e.stopPropagation();
  e.preventDefault();
  if (f) {
    f(e);
    notify();
  }
};
let idCounter = 0;
const localize = registry.get('localize');
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
      oninput: prevent(m.withAttr('value', Password.setPassword), notify),
      onchange: prevent(),
      onkeyup: prevent(),
      autocomplete: 'new-password',
      placeholder: passwordPlaceholder,
      id: `passw-${id}--input`,
    };
    const inputConfirm = {
      type: 'password',
      value: Password.confirm,
      oninput: prevent(m.withAttr('value', Password.setConfirm), notify),
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
          text: type !== 'signup' ? bundle.resetToNewPassword : bundle.newPassword
        },
        input: inputPassword,
        help: {
          text: Password.toShort() ? bundle.tooShortPassword :
            (Password.isValid() ? '' : localize(passconfig.message) || '')
        },
      }),
      m(FormGroup, {
        classNames: Password.confirmed() ? [] : ['has-error'],
        label: {text: bundle.confirmPassword, forInput: `passw-${id}--confirm`},
        input: inputConfirm,
        help: {text: Password.confirmed() ? '' : bundle.passwordMismatch},
      }),
    ]);
  },
});

