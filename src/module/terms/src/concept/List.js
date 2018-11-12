import registry from 'commons/registry';
import config from 'config';
import skosUtil from 'commons/tree/skos/util';
import ETBaseList from 'commons/list/common/ETBaseList';
import CreateDialog from 'commons/list/common/CreateDialog';
import RemoveDialog from 'commons/list/common/RemoveDialog';
import ConceptRow from 'commons/tree/skos/ConceptRow';
import TreeModel from 'commons/tree/TreeModel';
import { i18n, NLSMixin } from 'esi18n';
import escoList from 'commons/nls/escoList.nls';
import esteConcept from 'terms/nls/esteConcept.nls';

import declare from 'dojo/_base/declare';

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
  doneAction(graph) {
    const context = registry.get('context');
    registry.get('entrystoreutil').getEntryByType('skos:ConceptScheme', context)
      .then((csEntry) => {
        const md = skosUtil.addNewConceptStmts({
          md: graph,
          conceptRURI: this._newEntry.getResourceURI(),
          schemeRURI: csEntry.getResourceURI(),
          isRoot: true, // created from list
        });
        this._newEntry.setMetadata(md).commit().then((newCEntry) => {
          skosUtil.addConceptToScheme(newCEntry).then(() => {
            this.list.addRowForEntry(newCEntry);
            registry.get('incrementConceptCount')();
          });
        });
      });
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
      message = i18n.renderNLSTemplate(this.NLSBundles.esteConcept.cannotRemoveTermTree, label);
      registry.get('dialogs').acknowledge(message);
    } else {
      message = i18n.renderNLSTemplate(this.NLSBundles.esteConcept.confirmRemoveTerm, label);
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
        // this is hack, get the first (and hopefully only) concept sceheme in this context
        treeModel = new TreeModel(
          Object.assign(skosUtil.getSemanticRelations(), { rootEntry: entries[0] }));
      });

    this.inherited('postCreate', arguments);
    this.registerDialog('create', CCreateDialog);
    this.registerDialog('remove', CRemoveDialog);
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
