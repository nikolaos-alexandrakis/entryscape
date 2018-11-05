import registry from 'commons/registry';

import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';

export default declare([_WidgetBase], {
  buildRendering() {
    this.domNode = this.srcNodeRef || domConstruct.create('div');
    this.domNode.classList.add('list-group')
  },

  show() {
    this.inherited(arguments);
    const rdfutils = registry.get('rdfutils');
    const catalogs = [];
    const query = registry.get('entrystore')
      .newSolrQuery().rdfType('dcat:Catalog')
      .uriProperty('dcat:dataset', '*');
    query.list().forEach((catalogEntry) => {
      catalogs.push({
        entry: catalogEntry,
        label: rdfutils.getLabel(catalogEntry),
        nr: catalogEntry.getMetadata().find(catalogEntry.getResourceURI(), 'dcat:dataset').length,
      });
    }).then(() => {
      catalogs.sort((c1, c2) => (c1.nr < c2.nr ? 1 : -1));
      this.render(catalogs);
    });
  },

  render(catalogs) {
    this.domNode.innerHTML = '';
    catalogs.forEach((catalog) => {
      const p = {...params};
      p.context = catalog.entry.getContext().getId();

      // create anchor element
      const anchor = document.createElement('a');
      anchor.classList.add('list-group-item');
      anchor.innerHTML = `<span class='badge'>${catalog.nr}</span>${catalog.label}`;
      this.domNode.appendChild(anchor);
    });
  },
});
