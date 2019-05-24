import CreateDialog from 'commons/list/common/CreateDialog';
import EditDialog from 'commons/list/common/EditDialog';
import ETBaseList from 'commons/list/common/ETBaseList';
import RemoveDialog from 'commons/list/common/RemoveDialog';
import escoList from 'commons/nls/escoList.nls';
import registry from 'commons/registry';
import ConceptRow from 'commons/tree/skos/ConceptRow';
import skosUtil from 'commons/tree/skos/util';
import TreeModel from 'commons/tree/TreeModel';
import config from 'config';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import m from "mithril";
import ConceptUriComponent from "terms/concept/components/ConceptUri";
import esteConcept from 'terms/nls/esteConcept.nls';
import { expandConceptLocalName, isConceptSchemeNamespaced } from './util';

let treeModel;
const ns = registry.get('namespaces');


const CCreateDialog = declare(CreateDialog, {
  open() {
    registry.get('setConceptCount')(this.list.getView().getSize());
    if (!registry.get('withinConceptLimit')()) {
      return;
    }
    this.inherited(arguments);
  },
  /**
   * @override
   * @param {rdfjson/Graph} graph
   */
  async doneAction(graph) {
    /**
     * Get concept scheme info
     */
    const context = registry.get('context');
    const schemeEntry = await registry.get('entrystoreutil').getEntryByType('skos:ConceptScheme', context);
    const schemeRURI = schemeEntry.getResourceURI();

    /**
     * get the concept resource URI based on the uriSpace of the conceptScheme if exists
     */
    const conceptRURI = expandConceptLocalName(this._newEntry, schemeEntry);

    /**
     * create metadata graph for new concept scheme
     */
    this._newEntry.setResourceURI(conceptRURI);
    const md = skosUtil.addNewConceptStmts({
      md: graph,
      conceptRURI,
      schemeRURI,
      isRoot: true, // created from list
    });

    /**
     * create entry and add to concept scheme
     */
    const newConceptEntry = await this._newEntry.setMetadata(md).commit();
    await skosUtil.addConceptToScheme(newConceptEntry);

    /**
     * Append newly created entry to the list of entries
     */
    this.list.addRowForEntry(newConceptEntry);

    /**
     * Keep a general count of added concepts. Some instances have a limit
     */
    registry.get('incrementConceptCount')();
  },
});

const CEditDialog = declare(EditDialog, {
  open(params) {
    this.inherited(arguments);

    console.log(params);
    const { entry: conceptEntry } = params.row;
    const { conceptSchemeEntry } = params.list;

    this.conceptURINode = document.createElement('div');
    this.spaSideDialogBodyNode.insertBefore(this.conceptURINode, this.headerExtensionNode);
    m.mount(this.conceptURINode, { view: () => m(ConceptUriComponent, { conceptEntry, conceptSchemeEntry }) });
  },
  onDialogHide() {
    this.spaSideDialogBodyNode.removeChild(this.conceptURINode);
  },
});


const CRemoveDialog = declare([RemoveDialog, NLSMixin], {
  nlsBundles: [{ esteConcept }],
  constructor() {
    this.initNLS();
  },
  open(params) {
    this.params = params;
    this.cEntry = params.row.entry;
    this.inherited('open', params);
    const label = registry.get('rdfutils').getLabel(this.cEntry);
    let message;
    if (skosUtil.hasChildrenOrRelationsConcepts(this.cEntry)) {
      message = i18n.renderNLSTemplate(this.NLSLocalized.esteConcept.cannotRemoveTermTree, label);
      registry.get('dialogs').acknowledge(message);
    } else {
      message = i18n.renderNLSTemplate(this.NLSLocalized.esteConcept.confirmRemoveTerm, label);
      registry.get('dialogs').confirm(message).then(() => {
        this.remove();
      });
    }
  },
  clearRow() {
    this.params.row.destroy();
    this.list.removeRow(this.params.row);
    this.list.getView().clearSelection();
  },
  remove() {
    const entryRURI = this.cEntry.getResourceURI();
    treeModel.deleteEntry(this.cEntry).then(() => {
      // make UI changes
      this.clearRow();

      registry.get('decrementConceptCount')();

      // for each SKOS mappings delete those mappings
      const prom = skosUtil.getMappingRelations(entryRURI);
      prom.then((mappingRelations) => {
        mappingRelations.forEach((entries, mappedProperty) => {
          entries.forEach((mappedEntry) => {
            mappedEntry.getMetadata()
              .findAndRemove(mappedEntry.getResourceURI(), mappedProperty, entryRURI);

            mappedEntry.commitMetadata();
            mappedEntry.setRefreshNeeded();
            mappedEntry.refresh();
          });
        });
      });
    });
  },
});
const SkosConceptRow = declare([ConceptRow], {
  hideTerminologyInPath: true,
});

export default declare([ETBaseList], {
  includeCreateButton: true,
  includeInfoButton: true,
  includeEditButton: true,
  includeRemoveButton: true,
  nlsBundles: [{ escoList }, { esteConcept }],
  entryType: ns.expand('skos:Concept'),
  rootEntryType: ns.expand('skos:ConceptScheme'),
  entitytype: 'concept',
  nlsCreateEntryLabel: 'createTerm',
  nlsCreateEntryTitle: 'createTermPopoverTitle',
  nlsCreateEntryMessage: 'createTermPopoverMessage',
  searchVisibleFromStart: true,
  rowClickDialog: 'info',
  rowClass: SkosConceptRow,
  versionExcludeProperties: [
    'skos:narrower',
    'skos:broader',
    'skos:topConceptOf',
    'dcterms:partOf',
  ],
  rowActionNames: ['info', 'edit', 'versions', 'remove'],

  postCreate() {
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    const context = registry.get('context');

    // although this is a list view, the underlying model is still a tree
    // and we use the model for operations like delete
    es.newSolrQuery().rdfType(this.rootEntryType).context(context).limit(1)
      .getEntries(0)
      .then((entries) => {
        // this is hack, get the first (and hopefully only) concept scheme in this context
        this.conceptSchemeEntry = entries[0];
        if (isConceptSchemeNamespaced(this.conceptSchemeEntry)) { // show only if the terminology is namespaced
          this.registerDialog('edit', CEditDialog);
        }
        treeModel = new TreeModel(
          Object.assign({}, skosUtil.getSemanticProperties(), { rootEntry: entries[0] }));
      });

    this.inherited('postCreate', arguments);
    this.registerDialog('create', CCreateDialog);
    this.registerDialog('remove', CRemoveDialog);
  },
  // make sure the edit dialog is updated depending on the terminology at work is namespaced or not
  show() {
    if (this.conceptSchemeEntry) {
      const isEditWithoutNamespaceDialog = this.dialogs.edit instanceof EditDialog;
      if (isConceptSchemeNamespaced(this.conceptSchemeEntry) && isEditWithoutNamespaceDialog) {
        delete this.dialogs.edit;
        this.registerDialog('edit', CEditDialog);
      } else if (!isConceptSchemeNamespaced(this.conceptSchemeEntry) && !isEditWithoutNamespaceDialog) {
        delete this.dialogs.edit;
        this.registerDialog('edit', EditDialog);
      }
    }

    this.inherited(arguments);
  },
  getTemplate() {
    const templateId = config.terms.conceptTemplateId || '';
    return registry.get('itemstore').getItem(templateId);
  },
  getTemplateLevel() {
    return 'recommended';
  },
  getSearchObject() {
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    const context = registry.get('context');
    return es.newSolrQuery().rdfType(this.entryType).context(context);
  },
});
