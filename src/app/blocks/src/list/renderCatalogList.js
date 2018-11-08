import DOMUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import List from './List';
import EntryRow from 'commons/list/EntryRow';
import MetadataExpandRow from './MetadataExpandRow';
import defaults from 'commons/defaults';
import ArrayList from 'commons/store/ArrayList';

class _CatalogRowMixin {
  constructor() {
    this.showCol1 = true;
    this.showCol3 = false;
  }

  renderCol1() {
    this.col1Node.style.textAlign = 'left';
    this.col1Node.innerHTML = `<span class="badge">${this.entry.__nrOfDatasets}</span>`;
  }
  updateLocaleStrings() {
    this.inherited(arguments);
    this.renderCol1();
  }
  }

const CatalogList = declare([List], {
  updateRowClass() {
    if (this.conf.template != null) {
      this.rowClass = declare([MetadataExpandRow, _CatalogRowMixin], {});
      return true;
    }
    this.rowClass = declare([EntryRow, _CatalogRowMixin], {});
  },

  search() {
    const catalogs = [];
    defaults.get('entrystore').newSolrQuery()
                .rdfType('dcat:Catalog').uriProperty('dcat:dataset', '[* TO *]')
                .list()
      .forEach((catalogEntry) => {
        catalogEntry.__nrOfDatasets = catalogEntry.getMetadata().find(catalogEntry.getResourceURI(), 'dcat:dataset').length;
        catalogs.push(catalogEntry);
      })
      .then(() => {
        catalogs.sort((c1, c2) => c1.__nrOfDatasets < c2.__nrOfDatasets ? 1 : -1);
        this.listView.showEntryList(new ArrayList({ arr: catalogs }));
      });
  },
});

export default function (node, data, items) {
  const cl = new CatalogList({ conf: data, itemstore: items }, DOMUtil.create('div'));

  cl.show();
}
