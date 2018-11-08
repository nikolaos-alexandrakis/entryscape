import registry from 'commons/registry';
import ETBaseList from 'commons/list/common/ETBaseList';
import RemoveDialog from 'commons/list/common/RemoveDialog';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import EntryRow from 'commons/list/EntryRow';
import Export from 'commons/export/Export';
import { i18n } from 'esi18n';
import escoList from 'commons/nls/escoList.nls';
import esteCollectionexport from 'terms/nls/esteCollectionexport.nls';
import esteCollection from 'terms/nls/esteCollection.nls';
import declare from 'dojo/_base/declare';
import { createEntry } from 'commons/util/storeUtil';
import ManagemembersDialog from './ManagemembersDialog';

const ns = registry.get('namespaces');
const CDialog = declare(RDFormsEditDialog, {
  explicitNLS: true,
  maxWidth: 800,
  constructor(params) {
    this.list = params.list;
  },
  open() {
    this.list.getView().clearSearch();
    this.doneLabel = this.list.nlsSpecificBundle.createCollectionButton;
    this.title = this.list.nlsSpecificBundle.createCollectionHeader;
    this.updateTitleAndButton();
    const nds = createEntry(null, 'skos:Collection');
    this._newCollection = nds;
    nds.getMetadata().add(nds.getResourceURI(), ns.expand('rdf:type'), ns.expand('skos:Collection'));
    this.show(
      nds.getResourceURI(), nds.getMetadata(),
      this.list.getTemplate(), this.list.getTemplateLevel());
  },
  doneAction(graph) {
    this._newCollection.setMetadata(graph).commit().then((newEntry) => {
      this.list.getView().addRowForEntry(newEntry);
      return newEntry.refresh();
    });
  },
});

const CRemoveDialog = declare(RemoveDialog, {
  open(params) {
    this.collectionEntry = params.row.entry;
    this.inherited(arguments);
  },
  remove() {
    return this.removeHasPartRelations().then(() => this.collectionEntry.del());
  },
  removeHasPartRelations() {
    const members = [];
    const promises = [];
    const curi = this.collectionEntry.getResourceURI();
    return registry.get('entrystore')
      .newSolrQuery().rdfType('skos:Concept').uriProperty('dcterms:partOf', curi)
      .list()
      .forEach((m) => {
        members.push(m);
      })
      .then(() => {
        members.forEach((m) => {
          m.getMetadata().findAndRemove(m.getResourceURI(), 'dcterms:partOf', curi);
          promises.push(m.commitMetadata());
        });
        return Promise.all(promises);
      });
  },
});

const CollectionRow = declare([EntryRow], {
  showCol1: true,
  renderCol1() {
    const count = this.entry.getMetadata().find(this.entry.getResourceURI(), 'skos:member').length;
    $(this.domNode).addClass('termsCollection');
    this.col1Node.innerHTML = `<span class="badge">${count}</span>`;
    if (this.nlsSpecificBundle) {
      this.col1Node.setAttribute('title', i18n.renderNLSTemplate(this.nlsSpecificBundle.collectionMembers, count));
    }
  },
  updateLocaleStrings() {
    this.inherited(arguments);
    this.renderCol1();
  },
});

const ExportDialog = declare([Export], {
  nlsBundles: [{ esteCollectionexport }],
  nlsHeaderTitle: 'exportHeaderLabel',
  title: 'temporary', // to avoid exception
  profile: 'skoscollection',
  open(params) {
    const name = registry.get('rdfutils').getLabel(params.row.entry);
    this.title = i18n.renderNLSTemplate(this.NLSBundle0.exportHeaderLabel, { name });
    this.localeChange();
    this.inherited(arguments);
  },
});

export default declare([ETBaseList], {
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  nlsBundles: [{ escoList }, { esteCollection }],
  entryType: ns.expand('skos:Collection'), // change
  entitytype: 'conceptcollection',
  nlsEditEntryTitle: 'editCollectionTitle',
  nlsEditEntryLabel: 'editCollection',
  nlsRemoveEntryLabel: 'removeCollection',
  nlsRemoveEntryTitle: 'removeCollectionTitle',
  nlsCreateEntryLabel: 'createCollection',
  nlsCreateEntryTitle: 'createCollectionPopoverTitle',
  searchVisibleFromStart: false,
  rowClass: CollectionRow,
  rowClickDialog: 'members',
  versionExcludeProperties: ['skos:member'],
  rowActionNames: ['edit', 'versions', 'members', 'export', 'remove'],

  postCreate() {
    this.registerDialog('members', ManagemembersDialog);
    this.registerRowAction({
      name: 'members',
      button: 'default',
      icon: 'check-square-o',
      iconType: 'fa',
      nlsKey: 'manageMembers',
      nlsKeyTitle: 'manageMembersTitle',
    });
    this.registerDialog('export', ExportDialog);
    this.registerRowAction({
      first: true,
      name: 'export',
      button: 'default',
      icon: 'arrow-circle-o-down',
      iconType: 'fa',
      nlsKey: 'collectionExportTitle',
    });
    this.inherited('postCreate', arguments);
    this.registerDialog('create', CDialog);
    this.registerDialog('remove', CRemoveDialog);
    this.dialogs.create.levels.setIncludeLevel('optional');
  },
  show() {
    const self = this;
    const esu = registry.get('entrystoreutil');
    esu.preloadEntries(ns.expand('skos:Collection'), null).then(self.render());
  },
  getSearchObject() {
    const context = registry.get('context');
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().rdfType('skos:Collection').context(context);
  },
  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem('skosmos:conceptScheme');
    }
    return this.template;
  },
  getTemplateLevel() {
    return 'recommended';
  },
});
