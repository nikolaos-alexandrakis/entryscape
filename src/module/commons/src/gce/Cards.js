import registry from 'commons/registry';
import Cards from 'commons/nav/Cards';
import declare from 'dojo/_base/declare';

export default declare([Cards], {
  entryType: '', // E.g. "dcat:Catalog".
  getViewLabel(view, params, callback) {
    const context = registry.get('context');
    if (context) {
      if (this.entryType == null || this.entryType === '') {
        context.getEntry().then((entry) => {
          const rdfutils = registry.get('rdfutils');
          const name = entry === null ? '?' : rdfutils.getLabel(entry) || '-';
          callback(name, name);
        });
      } else {
        registry.get('entrystoreutil').getEntryByType(this.entryType, context)
          .then((entry) => {
            const rdfutils = registry.get('rdfutils');
            const name = entry === null ? '?' : rdfutils.getLabel(entry) || '-';
            callback(name, name);
          });
      }
    } else {
      callback('?');
    }
  },
});
