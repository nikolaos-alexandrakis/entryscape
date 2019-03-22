import escaDataset from 'catalog/nls/escaDataset.nls';
import BaseList from 'commons/list/common/BaseList';
import escoList from 'commons/nls/escoList.nls';
import registry from 'commons/registry';
import ArrayList from 'commons/store/ArrayList';
import htmlUtil from 'commons/util/htmlUtil';
import PublicView from 'commons/view/PublicView';
import declare from 'dojo/_base/declare';
import esreSource from 'registry/nls/esreSource.nls';
import DatasetDialog from './DatasetDialog';

const ns = registry.get('namespaces');

export default declare([BaseList, PublicView], {
  includeCreateButton: false,
  includeInfoButton: true,
  includeEditButton: false,
  includeRemoveButton: false,
  includeHead: false,
  searchVisibleFromStart: false,
  nlsBundles: [{ escoList }, { escaDataset }, { esreSource }],
  entryType: ns.expand('dcat:Dataset'),
  class: 'datasets',
  rowClickDialog: 'info',

  postCreate() {
    this.inherited('postCreate', arguments);
    this.registerDialog('info', DatasetDialog);
    const listnode = this.getView().domNode;
    this.headerNode = htmlUtil.create('h3', {
      style: { 'margin-bottom': '20px' },
      innerHTML: this.NLSBundles.esreSource.exploreHeader,
    }, listnode, true);
  },
  localeChange() {
    this.inherited(arguments);
    if (this.headerNode) {
      this.headerNode.innerHTML = this.NLSBundles.esreSource.exploreHeader;
    }
  },
  show() {
    const graph = registry.get('clipboardGraph');
    if (graph == null || graph.isEmpty()) {
      const bundle = this.NLSBundles.esreSource;
      registry.get('dialogs').acknowledge(bundle.noRDF, bundle.noRDFProceed).then(() => {
        registry.get('siteManager').render('toolkit__rdf__source');
      });
      return;
    }
    this.inherited(arguments);
  },

  showStopSign() {
    return false;
  },
  /**
   *
   * @param params
   * @param row
   * @return {boolean}
   */
  installActionOrNot(params, row) {
    switch (params.name) {
      case 'versions':
        return row.entry.getEntryInfo().hasMetadataRevisions();
      default:
        return true;
    }
  },
  /**
   *
   * @param entry
   * @return {*}
   */
  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem('dcat:OnlyDataset');
    }
    return this.template;
  },
  /**
   *
   * @param params
   */
  search() {
    const graph = registry.get('clipboardGraph');
    const temp = registry.get('entrystore').getContextById('__temporary');

    const pelist = graph.find(null, 'rdf:type', 'dcat:Dataset').map((stmt) => {
      const uri = stmt.getSubject();
      const de = temp.newLink(uri);
      de.setMetadata(graph);
      return de;
    });
    this.listView.showEntryList(new ArrayList({ arr: pelist }));
  },
});
