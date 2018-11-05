import BaseList from './BaseList';
import typeIndex from 'commons/create/typeIndex';

import declare from 'dojo/_base/declare';

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
    return this.NLSBundle1[this.emptyListWarningNLS];
  },
});
