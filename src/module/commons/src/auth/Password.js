import config from 'config';

const getPasswordConfiguration = () => config.entrystore.password || {};
const noUppercase = password => password === password.toLowerCase();
const noLowercase = password => password === password.toUpperCase();
const noSymbol = password => password.toLowerCase().match(/^[0-9a-z]+$/);
const noNumber = password => password.match(/[0-9]/) === null;
const failedCustomCheck = password => getPasswordConfigruation().custom.some(re => password.match(re) === null);

const P = {
  password: '',
  confirm: '',
  clear() {
    P.password = '';
    P.confirm = '';
  },
  setPassword(value, e) {
    P.password = value;
  },
  setConfirm(value, e) {
    P.confirm = value;
  },
  toShort() {
    return P.password.length < 8 && P.password.length > 0;
  },
  confirmed() {
    return P.password === P.confirm;
  },
  provided() {
    return P.password.length > 0 || P.confirm.length > 0;
  },
  isValid() {
    if (P.toShort()) {
      return false;
    }
    if (getPasswordConfiguration().uppercase && noUppercase(P.password)) {
      return false;
    }
    if (getPasswordConfiguration().lowercase && noLowercase(P.password)) {
      return false;
    }
    if (getPasswordConfiguration().symbol && noSymbol(P.password)) {
      return false;
    }
    if (getPasswordConfiguration().number && noNumber(P.password)) {
      return false;
    }
    if (getPasswordConfiguration().custom && failedCustomCheck(P.password)) {
      return false;
    }
    return true;
  },
  canSubmit() {
    if (P.provided()) {
      return P.isValid() && P.confirmed();
    }
    return true;
  },
};

export default P;
