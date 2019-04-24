import typeIndex from 'commons/create/typeIndex';
import declare from 'dojo/_base/declare';
import BaseList from './BaseList';

export default declare([BaseList], {
  entitytype: '',
  emptyListWarningNLS: 'emptyListWarning',
  conf: null,

  loadEntityTypeConf() {
    if (this.entitytype != null && this.entitytype !== '') {
      this.conf = typeIndex.getConfByName(this.entitytype);
    }
  },

  getIconClass() {
    this.loadEntityTypeConf();
    if (this.conf && this.conf.faClass) {
      return this.conf.faClass;
    }

    return '';
  },

  getEmptyListWarning() {
    return this.NLSLocalized1[this.emptyListWarningNLS];
  },
});
