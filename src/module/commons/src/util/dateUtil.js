import config from 'config';
import { i18n } from 'esi18n';

export default {
  getMultipleDateFormats(date) {
    let period = 'older';
    const lang = i18n.getLocale();
    const shortDateFormat = this.getDateFormat(lang);
    const modDateMedium = i18n.getDate(date, { selector: 'date', formatLength: 'medium' });
    let short = modDateMedium;
    const cd = new Date();
    const currentDateMedium = i18n.getDate(cd, { selector: 'date', formatLength: 'medium' });
    if (currentDateMedium === modDateMedium) {
      period = 'today';
      short = i18n.getDate(date, { selector: 'time', formatLength: 'short' });
    } else if (date.getYear() === cd.getYear()) {
      period = 'thisyear';
      short = i18n.getDate(date, { selector: 'date', datePattern: shortDateFormat });
    }
    const dateTimes = {
      dateMedium: modDateMedium,
      timeMedium: i18n.getDate(date, { selector: 'time', formatLength: 'medium' }),
      full: i18n.getDate(date, { formatLength: 'full' }),
      short,
      period,
    };

    return dateTimes;
  },
  getDateFormat(localLang) {
    for (let i = 0; i < config.locale.supported.length; i++) {
      const supportedLang = config.locale.supported[i].lang;
      if (localLang === supportedLang) {
        return config.locale.supported[i].shortDatePattern;
      }
    }

    return '';
  },
};
