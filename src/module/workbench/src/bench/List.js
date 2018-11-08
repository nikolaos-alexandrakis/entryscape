import registry from 'commons/registry';
import typeIndex from 'commons/create/typeIndex';
import ListView from 'commons/list/ListView';
import EntryRow from 'commons/list/EntryRow';
import BaseList from 'commons/list/common/BaseList';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import ToggleRow from 'commons/list/common/ToggleRow';
import RemoveDialog from 'commons/list/common/RemoveDialog';
import { i18n } from 'esi18n';
import escoList from 'commons/nls/escoList.nls';
import eswoBench from 'workbench/nls/eswoBench.nls';
import declare from 'dojo/_base/declare';
import CreateDialog from './CreateDialog';
import ImportDialog from './ImportDialog';
import ReplaceDialog from './ReplaceDialog';

const BenchListView = declare([ListView], {
  showPage() {
    this.inherited(arguments).then(() => {
      // Update index and badge in bench
      if (this.searchTerm == null || this.searchTerm.length === 0) {
        const conf = this.list.benchTypeConf;
        const cid = registry.get('context').getId();
        typeIndex.set(cid, conf, this.entryList.getSize());
        this.list.bench.updateBadge(conf);
      }
    });
  },
  action_refresh() { // overwritten, to clear content view on refresh
    this.inherited(arguments);
    if (this.list.listAndContentViewer) {
      this.list.listAndContentViewer.clearContentView();
    }
  },
});

const RemoveEntityDialog = declare([RemoveDialog], {
  remove() {
    const conf = this.currentParams.row.list.benchTypeConf;
    const relation = conf.splitRelation;
    const splitEntityConf = typeIndex.getConfByName(conf.splitEntitytype);
    const rdfType = splitEntityConf.rdfType;
    const es = registry.get('entrystore');
    const self = this;
    return es.newSolrQuery()
      .uriProperty(relation, self.currentParams.row.entry.getResourceURI())
      .rdfType(rdfType)
      .list()
      .getEntries(0)
      .then((entries) => {
        if (entries.length > 0) {
          Promise.all(entries.forEach(entry => entry.del()))
            .then(() => self.currentParams.row.entry.del().then(() => {
              self.currentParams.row.list.listAndContentViewer.clearContentView();
            }));
        } else {
          self.currentParams.row.entry.del().then(() => {
            self.currentParams.row.list.listAndContentViewer.clearContentView();
          });
        }
      });
  },
});

const EntityRow = declare([ToggleRow], {
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
      this.protectedNode.setAttribute('title', specific.privateDisabledTitle);
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

const DownloadDialog = declare(null, {
  open(params) {
    this.entry = params.row.entry;
    const resURI = this.entry.getResourceURI();
    window.open(resURI, '_blank');
  },
});

const PresenterRow = declare([EntryRow], {
  postCreate() {
    this.inherited('postCreate', arguments);
  },
});

const MarkRowSelection = declare([ListDialogMixin], {
  connectIfFirstDialogOpen() {
    if (this.list) { // clear all rows
      this.list.getView().clearSelection();
    }
  },
});

const RowAction = declare([MarkRowSelection], {
  open(params) {
    this.inherited(arguments);
    params.row.list.listAndContentViewer.open(params.row.list.benchTypeConf, params);
  },
});

export default declare([BaseList], {
  listViewClass: BenchListView,
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  includeResultSize: false,
  includeSortOptions: false,
  includeHeader: false,
  searchInList: true,
  nlsBundles: [{ escoList }, { eswoBench }],
  class: 'eswoBenchList',
  benchTypeConf: null,
  bench: null,
  rowClickDialog: 'info',
  postCreate() {
    this.entryType = this.benchTypeConf.rdfType;
    this.includeCreateButton = this.benchTypeConf.createDialog !== false;
    if (this.benchTypeConf.importDialog === true) {
      this.registerListAction({
        name: 'import',
        button: 'default',
        icon: 'upload',
        iconType: 'fa',
        disableOnSearch: true,
        nlsKey: 'import',
      });
      this.registerDialog('import', ImportDialog);
    }

    this.registerRowAction({
      name: 'replace',
      button: 'default',
      icon: 'tag',
      iconType: 'fa',
      nlsKey: 'replaceMenu',
      nlsKeyTitle: 'replaceMenuTitle',
    });
    this.registerRowAction({
      name: 'download',
      button: 'default',
      iconType: 'fa',
      icon: 'download',
      nlsKey: 'downloadButton',
      nlsKeyTitle: 'downloadButtonTitle',
    });
    this.registerDialog('download', DownloadDialog);
    this.registerDialog('replace', ReplaceDialog);
    if (this.benchTypeConf.split) {
      this.rowClickDialog = 'listAndContentViewer';
      this.registerDialog('listAndContentViewer', RowAction);
    }
    if (this.benchTypeConf.publishable) {
      this.rowClass = EntityRow;
      this.nlsPublicTitle = 'publicTitle';
      this.nlsProtectedTitle = 'privateTitle';
    }
    // hide create button depends on user role
    if (this.mode === 'present') {
      this.rowClass = PresenterRow;
      this.includeCreateButton = false;
    }

    this.inherited('postCreate', arguments);
    if (this.benchTypeConf.createDialog !== false) {
      this.registerDialog('create', CreateDialog);
    }
    if (this.benchTypeConf.split && this.benchTypeConf.splitEntityDependedOn) {
      this.registerDialog('remove', RemoveEntityDialog);
    } else {
      this.registerDialog('remove', RemoveDialog);
    }

    this.listView.includeResultSize = !!this.includeResultSize; // make this boolean
  },

  installActionOrNot(params, row) {
    // change menu item title & tool tip based on entry type
    const e = row.entry;
    if (params.name === 'replace') {
      if (e.isLink()) {
        params.nlsKey = 'replaceLinkMenu';
        params.nlsKeyTitle = 'replaceLinkMenuTitle';
      } else if (e.isLocal() && e.isInformationResource()) {
        params.nlsKey = 'replaceFileMenu';
        params.nlsKeyTitle = 'replaceFileMenuTitle';
      } else {
        return 'disabled';
      }
    }
    if (params.name === 'download') {
      if (e.isLink() || (e.isLocal() && !e.isInformationResource())) {
        return 'disabled';
      }
    }
    if (params.name === 'versions') { // ESCO-76 fix
      return row.entry.getEntryInfo().hasMetadataRevisions();
    }
    return undefined;
  },

  showStopSign() {
    return false;
  },

  getName() {
    return registry.get('localize')(this.benchTypeConf.label);
  },

  getIconClass() {
    return this.benchTypeConf.faClass;
  },

  addRowForEntry() {
    this.inherited(arguments);
    // clear selected row if any
    if (this.listAndContentViewer) {
      this.listAndContentViewer.clearContentView();
      this.getView().clearSelection();
    }
  },
  removeRow(row) {
    this.inherited(arguments);
    typeIndex.remove(row.entry);
    this.bench.updateBadge(typeIndex.getConf(row.entry));
  },
  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem(this.benchTypeConf.template);
    }
    return this.template;
  },
  getTemplateLevel() {
    return this.benchTypeConf.templateLevel;
  },

  search(paramsParams) {
    const params = paramsParams || {};
    const term = params.term != null && params.term.length > 0 ? params.term : '';
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    const qo = typeIndex.query(es.newSolrQuery(), this.benchTypeConf, term)
      .context(registry.get('context'));
    if (params.sortOrder === 'title') {
      const l = i18n.getLocale();
      qo.sort(`title.${l}+desc`);
    }
    this.listView.showEntryList(qo.list());
  },
});
