import registry from 'commons/registry';
import ListView from 'commons/list/ListView';
import { i18n } from 'esi18n';
import declare from 'dojo/_base/declare';

export default declare([ListView], {
  // constructor() {
  //   this.catalogPromise = new Promise(); // TODO perhaps remove this if not needed by checkAndRepairListener.js
  // },
  updateHeader() {
    const context = registry.get('context');
    if (context) {
      this.catalogPromise = new Promise((resolve, reject) => {
        registry.get('entrystoreutil')
          .getEntryByType('dcat:Catalog', context)
          .then((dcat) => {
            const rdfutils = registry.get('rdfutils');
            const catalogName = dcat === null ? '?' : rdfutils.getLabel(dcat) || '-';
            const listheader =
              i18n.renderNLSTemplate(this.nlsSpecificBundle[this.nlsListHeaderKey], { 1: catalogName })
              || i18n.renderNLSTemplate(this.nlsGenericBundle[this.nlsListHeaderKey], { 1: catalogName })
              || '';

            this.listHeader.innerHTML = listheader;
            this.listHeader.setAttribute('title', this.nlsSpecificBundle[
              this.nlsListHeaderTitleKey] || this.nlsGenericBundle[this.nlsListHeaderTitleKey] || '');
            resolve(dcat);
          }, () => reject(dcat));
      });
    }
  },
});
