import registry from 'commons/registry';
import BaseList from 'commons/list/common/BaseList';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import TitleDialog from 'commons/dialog/TitleDialog';
import htmlUtil from 'commons/util/htmlUtil';
import typeIndex from 'commons/create/typeIndex';
import config from 'config';
import {i18n, NLSMixin} from 'esi18n';
import escoList from 'commons/nls/escoList.nls';
import escaShowResults from 'catalog/nls/escaShowResults.nls';
import declare from 'dojo/_base/declare';

const ns = registry.get('namespaces');

const ResultsList = declare([BaseList], {
  nlsBundles: [{escoList}, {escaShowResults}],
  nlsCreateEntryMessage: null,
  includeRefreshButton: false,
  includeInfoButton: true,
  includeEditButton: false,
  includeRemoveButton: false,
  includeCreateButton: false,
  includeResultSize: false,
  entryType: ns.expand('esterms:Result'),
  rowClickDialog: 'info',

  postCreate() {
    this.inherited('postCreate', arguments);
    this.listView.includeResultSize = this.includeResultSize;
  },

  getIconClass() {
    const typeConf = typeIndex.getConfByName('datasetResult');// hardcoded entityname
    if (typeConf && typeConf.faClass) {
      return typeConf.faClass;
    }

    return '';
  },

  getEmptyListWarning() {
    return this.NLSBundle1.emptyListWarning;
  },
  getSearchObject() {
    const context = registry.get('context');
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().rdfType(this.entryType)
      .uriProperty('dcterms:source', this.entry.getResourceURI())
      .context(context.getResourceURI());
  },
  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem(
        config.catalog.datasetResultTemplateId);
    }
    return this.template;
  },
});

export default declare([TitleDialog, ListDialogMixin, NLSMixin.Dijit], {
  nlsBundles: [{escaShowResults}],
  maxWidth: 800,
  includeFooter: false,

  postCreate() {
    this.resultsList = new ResultsList(null, htmlUtil.create('div', null, this.containerNode));
    this.inherited(arguments);
  },
  open(params) {
    this.inherited(arguments);
    this.entry = params.row.entry;
    this.resultsList.entry = this.entry;
    this.resultsList.render();
    const title = registry.get('rdfutils').getLabel(this.entry);
    this.updateLocaleStringsExplicit(
      i18n.localize(escaShowResults, 'showResultsDialogHeader', {1: title}),
    );
    this.show();
  },
});

