import registry from 'commons/registry';
import ETBaseList from 'commons/list/common/ETBaseList';
import ToggleRow from 'commons/list/common/ToggleRow';
import config from 'config';
import escoList from 'commons/nls/escoList.nls';
import escaResults from 'catalog/nls/escaResults.nls';
import declare from 'dojo/_base/declare';

const ns = registry.get('namespaces');

const ResultRow = declare([ToggleRow], {
  nlsPublicTitle: 'publicResultTitle',
  nlsProtectedTitle: 'privateResultTitle',
  nlsContextSharingNoAccess: '',
  nlsConfirmRemoveRow: '',

  postCreate() {
    this.inherited('postCreate', arguments);
    this.nlsPublicTitle = this.list.nlsPublicTitle;
    this.nlsProtectedTitle = this.list.nlsProtectedTitle;
    this.nlsContextSharingNoAccess = '';
    this.nlsConfirmRemoveRow = this.list.nlsConfirmRemoveRow;
    this.entry.getContext().getEntry().then((contextEntry) => {
      this.catalogPublic = contextEntry.isPublic();
      this.setToggled(contextEntry.isPublic(), this.entry.isPublic());
    });
  },
  updateLocaleStrings(generic, specific) {
    this.inherited('updateLocaleStrings', arguments);
    if (!this.catalogPublic) {
      this.protectedNode.setAttribute('title', specific.privateDisabledResultTitle)
    }
  },
  toggleImpl(onSuccess) {
    const ei = this.entry.getEntryInfo();
    const acl = ei.getACL(true);
    registry.get('getGroupWithHomeContext')(this.entry.getContext()).then((groupEntry) => {
      if (this.isPublicToggle) {
        acl.admin = acl.admin || [];
        acl.admin.push(groupEntry.getId());
        ei.setACL(acl);
        ei.commit().then(onSuccess);
      } else {
        ei.setACL({});
        ei.commit().then(onSuccess);
      }
    });
  },
});

export default declare([ETBaseList], {
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  nlsBundles: [{escoList}, {escaResults}],
  entryType: ns.expand('esterms:Result'),
  entitytype: 'datasetResult',
  rowClass: ResultRow,
  nlsPublicTitle: 'publicResultTitle',
  nlsProtectedTitle: 'privateResultTitle',
  nlsRemoveEntryConfirm: 'confirmRemoveResult',
  searchVisibleFromStart: false,
  rowClickDialog: 'edit',

  postCreate() {
    this.inherited('postCreate', arguments);
  },

  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem(
        config.catalog.datasetResultTemplateId);
    }
    return this.template;
  },
  getSearchObject() {
    const context = registry.get('context');
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().rdfType(this.entryType).context(context.getResourceURI());
  },
});
