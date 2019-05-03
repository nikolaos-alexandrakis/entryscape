import escaFilesList from 'catalog/nls/escaFilesList.nls';
import EntryType from 'commons/create/EntryType';
import BaseList from 'commons/list/common/BaseList';
import RemoveDialog from 'commons/list/common/RemoveDialog';
import EntryRow from 'commons/list/EntryRow';
import escoList from 'commons/nls/escoList.nls';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import stamp from 'dojo/date/stamp';
import ReplaceDialog from 'workbench/bench/ReplaceDialog';

const ns = registry.get('namespaces'); // TODO perhaps remove closer to where it's actually needed

const FileReplaceDialog = declare(ReplaceDialog, {
  footerButtonAction() {
    this.distributionEntry = this.list.entry;
    const distResourceURI = this.distributionEntry.getResourceURI();
    const distMetadata = this.distributionEntry.getMetadata();
    const inp = this.fileOrLink.getFileInputElement();
    const md = this.entry.getMetadata();
    md.findAndRemove(null, 'dcterms:title');
    md.addL(this.entry.getResourceURI(), 'dcterms:title', this.fileOrLink.getValue());
    return this.entry.commitMetadata().then(() => this.entry.getResource(true).putFile(inp).then(() => {
      distMetadata.findAndRemove(distResourceURI, 'dcterms:modified');
      distMetadata.addD(distResourceURI, 'dcterms:modified', stamp.toISOString(new Date()), 'xsd:date');
      return this.distributionEntry.commitMetadata().then(() => {
        // check here ..need to update list rows to update dropdown items
        this.list.setListModified('replace', this.entry.getResourceURI());
        this.list.rowMetadataUpdated(this.row, true);
        this.entry.setRefreshNeeded();
        return this.entry.refresh();
      });
    }));
  },
});

const RemoveFileDialog = declare([RemoveDialog], {
  remove() {
    this.distributionEntry = this.list.entry;
    this.fileEntry = this.currentParams.row.entry;
    const fileResourceURI = this.fileEntry.getResourceURI();
    const distMetadata = this.distributionEntry.getMetadata();
    const distResourceURI = this.distributionEntry.getResourceURI();
    distMetadata.findAndRemove(distResourceURI, 'dcat:accessURL', fileResourceURI);
    distMetadata.findAndRemove(distResourceURI, 'dcat:downloadURL', fileResourceURI);
    distMetadata.findAndRemove(distResourceURI, 'dcterms:modified');
    distMetadata.addD(distResourceURI, 'dcterms:modified', stamp.toISOString(new Date()), 'xsd:date');
    return this.distributionEntry.commitMetadata().then(() => {
      // update dropdown menu items
      if (this.currentParams.row.list.parentRow) {
        this.currentParams.row.list.parentRow.updateDropdownMenu();
      }
      return this.currentParams.row.entry.del().then(() => {
        this.list.setListModified('remove', fileResourceURI);
        this.currentParams.row.list.getView().action_refresh();
      });
    });
  },
});

const AddFileDialog = declare(RDFormsEditDialog, {
  explicitNLS: true,
  maxWidth: 800,
  postCreate() {
    const valueChange = (value) => {
      if (value != null) {
        this.unlockFooterButton();
      } else {
        this.lockFooterButton();
      }
    };
    this.fileOrLink = new EntryType({
      valueChange,
    }, htmlUtil.create('div', null, this.containerNode, true));
    this.inherited(arguments);
  },
  updateGenericCreateNLS() {
    this.doneLabel = this.list.nlsSpecificBundle.createButton;
    this.title = this.list.nlsSpecificBundle.createHeader;
    this.updateTitleAndButton();
  },
  open(params) {
    this.currentParams = params;
    const context = registry.get('context');
    this.distributionEntry = params.list.entry;
    this.fileOrLink.show(true, false, false);
    this.updateGenericCreateNLS();
    this._newEntry = context.newEntry();
    const nds = this._newEntry;
    nds.getMetadata().add(nds.getResourceURI(), 'rdf:type', 'esterms:File');
    this.show(nds.getResourceURI(), nds.getMetadata(), this.list.getTemplate(), 'recommended');
  },
  doneAction(graph) {
    this.distributionEntry = this.list.entry;
    const title = graph.findFirstValue(null, 'dcterms:title');
    if (!title) {
      // check whether graph have title or not
      graph.addL(this._newEntry.getResourceURI(), 'dcterms:title', this.fileOrLink.getValue());
    }
    this._newEntry.setMetadata(graph);
    return this._newEntry.commit().then(fileEntry => fileEntry.getResource(true)
      .putFile(this.fileOrLink.getFileInputElement())
      .then(() => fileEntry.refresh().then(() => {
        this.list.getView().addRowForEntry(fileEntry);
        const fileResourceURI = fileEntry.getResourceURI();
        const distMetadata = this.distributionEntry.getMetadata();
        const distResourceURI = this.distributionEntry.getResourceURI();
        distMetadata.add(distResourceURI, 'dcat:accessURL', fileResourceURI);
        distMetadata.add(distResourceURI, 'dcat:downloadURL', fileResourceURI);
        distMetadata.findAndRemove(distResourceURI, 'dcterms:modified');
        distMetadata.addD(distResourceURI, 'dcterms:modified', stamp.toISOString(new Date()), 'xsd:date');
        const format = fileEntry.getEntryInfo().getFormat();
        const manualFormatList = distMetadata.find(distResourceURI, 'dcterms:format');
        if (typeof format !== 'undefined' && manualFormatList.length === 0) {
          distMetadata.addL(distResourceURI, 'dcterms:format', format);
        }
        return this.distributionEntry.commitMetadata().then(() => {
          // update row menu items
          if (this.currentParams.list.parentRow) {
            this.currentParams.list.parentRow.updateDropdownMenu();
          }
          this.list.setListModified('add', fileResourceURI);
          this.distributionEntry.setRefreshNeeded();
          return this.distributionEntry.refresh();
          // this.list.getView().addRowForEntry(fileEntry);
          // this.list.getView().action_refresh();
        });
      })));
  },
});

const DownloadDialog = declare(null, {
  open(params) {
    this.entry = params.row.entry;
    const resURI = this.entry.getResourceURI();
    window.open(resURI, '_blank');
  },
});

const FileRow = declare(EntryRow, {
  // to be removed
  installButtonOrNot(params) {
    const fileStmts = this.list.entry.getMetadata().find(this.list.entry.getResourceURI(), 'dcat:downloadURL');
    if (fileStmts.length === 1 && params.name === 'remove') {
      return 'disabled';
    }
    return this.inherited(arguments);
  },
  installActionOrNot(params) {
    const fileStmts = this.list.entry.getMetadata().find(this.list.entry.getResourceURI(), 'dcat:downloadURL');
    if (fileStmts.length === 1 && params.name === 'remove') {
      return 'disabled';
    }
    return this.inherited(arguments);
  },
});

export default declare([BaseList], {
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  includeRefreshButton: false,
  includeSortOptions: false,
  nlsBundles: [{ escoList }, { escaFilesList }],
  nlsRemoveEntryConfirm: 'confirmRemoveFile',
  nlsEditEntryTitle: 'editFileTitle',
  nlsEditEntryLabel: 'editFileLabel',
  nlsRemoveEntryTitle: 'removeFileTitle',
  nlsRemoveEntryLabel: 'removeFileLabel',
  nlsListHeaderKey: 'headerTitle',
  nlsListHeaderTitleKey: 'headerTitle',
  entryType: ns.expand('esterms:File'),
  rowActionNames: ['edit', 'replace', 'download', 'remove'],
  rowClass: FileRow,
  listModified: false,
  includeResultSize: false,
  postCreate() {
    this.registerRowAction({
      name: 'replace',
      button: 'default',
      icon: 'exchange-alt',
      iconType: 'fa',
      nlsKey: 'replaceMenu',
      nlsKeyTitle: 'replaceMenuTitle',
    });
    this.registerRowAction({
      name: 'download',
      button: 'default',
      iconType: 'fa',
      icon: 'download',
      nlsKey: 'downloadButtonTitle',
      nlsKeyTitle: 'downloadButtonTitle',
    });
    this.registerDialog('replace', FileReplaceDialog);
    this.registerDialog('download', DownloadDialog);
    this.inherited('postCreate', arguments);
    this.registerDialog('create', AddFileDialog);
    this.registerDialog('remove', RemoveFileDialog);
    /**
     * Keeps in memory the newly added files to facilitate refresh API functionality.
     * Essentially, if this not empty then the refresh API mechanism updates the API only with the newly added files.
     */
    /**
     * <add, fileResourceURI>
     * @type {Array<Array>}
     */
    this.listModifications = [];
  },
  localeChange() {
    this.inherited(arguments);
  },
  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').createTemplateFromChildren([
        'dcterms:title',
      ]);
    }
    return this.template;
  },
  getSearchObject() {
    const context = registry.get('context');
    const fileStmts = this.entry.getMetadata().find(this.entry.getResourceURI(), 'dcat:downloadURL');
    const fileURIs = fileStmts.map(fileStmt => fileStmt.getValue());
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().rdfType(this.entryType).context(context.getResourceURI())
      .resource(fileURIs);
  },
  /**
   * Records how the list of files  was modified.
   *
   * Type can be one of
   *  - add
   *  - replace
   *  - remove
   *
   *  Side effect: this.newlyAddedFileURIs is cleared on replace/remove modifications and updated on addition.
   * @param {string} type - The type of modification
   * @param {string} fileResourceURI - The resource URI of the file modified
   */
  setListModified(type, fileResourceURI) {
    this.listModifications.push([type, fileResourceURI]);
  },
  /**
   * Check if some modification has happened
   * @return {boolean}
   */
  isListUpdated() {
    return !!this.listModifications.length;
  },
  /**
   * Check if modifications have occurred and they are all additions
   * @return {boolean}
   */
  hasOnlyAddedFiles() {
    // eslint-disable-next-line
    return this.isListUpdated() && this.listModifications.every(([modificationType,]) => modificationType === 'add');
  },
  /**
   * Return the newly added files URIs
   * @returns {Array}
   */
  getAddedFileURIs() {
    return this.listModifications.reduce((accumulator, [modificationType, fileURI]) => {
      if (modificationType === 'add') {
        accumulator.push(fileURI);
      }
      return accumulator;
    }, []);
  },
});
