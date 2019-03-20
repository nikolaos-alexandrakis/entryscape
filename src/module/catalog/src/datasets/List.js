import registry from 'commons/registry';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import ETBaseList from 'commons/list/common/ETBaseList';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import CommentDialog from 'commons/comments/CommentDialog';
import VersionsDialog from 'commons/list/common/VersionsDialog';
import DowngradeDialog from 'catalog/candidates/DowngradeDialog';
import { i18n } from 'esi18n';
import config from 'config';
import escoList from 'commons/nls/escoList.nls';
import escaDataset from 'catalog/nls/escaDataset.nls';
import { withinDatasetLimit } from 'catalog/utils/limit';
import { createEntry } from 'commons/util/storeUtil';
import declare from 'dojo/_base/declare';
import checkAndRepairListener from './checkAndRepairListener';
import DatasetRow from './DatasetRow';
import ManageFiles from './ManageFiles';
import FileReplaceDialog from './FileReplaceDialog';
import ListView from '../utils/ListView';
import CreateDistribution from './CreateDistribution';
import ShowResultsDialog from './ShowResultsDialog';
import ShowIdeasDialog from './ShowIdeasDialog';

const ns = registry.get('namespaces');
const CreateDialog = declare(RDFormsEditDialog, {
  explicitNLS: true,
  maxWidth: 800,
  open() {
    if (!withinDatasetLimit(this.list.getView().getSize()) && config.catalog.datasetLimitDialog) {
      registry.get('dialogs').restriction(config.catalog.datasetLimitDialog);
      return;
    }
    this.list.getView().clearSearch();

    // this.set("doneLabel", this.list.nlsSpecificBundle.createDatasetButton);
    // this.set("title", this.list.nlsSpecificBundle.createDatasetHeader);
    this.doneLabel = this.list.nlsSpecificBundle.createDatasetButton;
    this.title = this.list.nlsSpecificBundle.createDatasetHeader;
    this.updateTitleAndButton();
    const nds = createEntry(null, 'dcat:Dataset');
    // This following will explicit set ACL to include the group as owner
    // (to make the dataset private by default),
    // well in time before user has filled in metadata and pressed done.
    registry.get('getGroupWithHomeContext')(nds.getContext()).then((groupEntry) => {
      const ei = nds.getEntryInfo();
      const acl = ei.getACL(true);
      acl.admin.push(groupEntry.getId());
      ei.setACL(acl);
    });

    this._newDataset = nds;
    nds.getMetadata().add(
      nds.getResourceURI(), 'rdf:type', 'dcat:Dataset');
    this.showEntry(nds);
  },
  doneAction(graph) {
    return this._newDataset.setMetadata(graph).commit().then((newEntry) => {
      this.list.getView().addRowForEntry(newEntry);
      return registry.get('entrystoreutil').getEntryByType('dcat:Catalog', newEntry.getContext()).then((catalog) => {
        catalog.getMetadata().add(catalog.getResourceURI(),
          ns.expand('dcat:dataset'), newEntry.getResourceURI());
        return catalog.commitMetadata().then(() => {
          newEntry.setRefreshNeeded();
          return newEntry.refresh();
        });
      });
    });
  },
});

const EditDistributionDialog = declare([RDFormsEditDialog, ListDialogMixin], {
  maxWidth: 800,
  explicitNLS: true,
  open(params) {
    this.inherited(arguments);
    const entry = params.row.entry;
    // this.set("title", this.list.nlsSpecificBundle.editDistributionHeader);
    // this.set("doneLabel", this.list.nlsSpecificBundle.editDistributionButton);
    this.doneLabel = this.list.nlsSpecificBundle.editDistributionButton;
    this.title = this.list.nlsSpecificBundle.editDistributionHeader;
    this.updateTitleAndButton();
    registry.set('context', entry.getContext());
    if (this.row.isUploadedDistribution() ||
      this.row.isAPIDistribution()) {
      this.editor.filterPredicates = {
        'http://www.w3.org/ns/dcat#accessURL': true,
        'http://www.w3.org/ns/dcat#downloadURL': true,
      };
    } else {
      this.editor.filterPredicates = {};
    }
    entry.setRefreshNeeded();
    entry.refresh().then(() => {
      this.showChildEntry(
        entry, this.row.datasetRow.entry, this.list.getTemplateLevel(entry));
    });
  },
  doneAction(graph) {
    this.row.entry.setMetadata(graph);
    return this.row.entry.commitMetadata().then(() => {
      this.row.renderMetadata();
    });
  },
});

const CommentDialog2 = declare([CommentDialog], {
  maxWidth: 800,
  title: 'temporary',
  open(params) {
    this.inherited(arguments);
    const name = registry.get('rdfutils').getLabel(params.row.entry);
    this.title = i18n.renderNLSTemplate(this.list.nlsSpecificBundle.commentHeader, { name });
    this.footerButtonLabel = this.list.nlsSpecificBundle.commentFooterButton;
    this.localeChange();
  },
});

const DistVersionDialog = declare([VersionsDialog], {
  nlsReasonForRevisionMessage: 'distReasonForRevisionMessage',
  nlsNoRevertSameGraphExcludeTitle: 'distNoRevertSameGraphExcludeTitle',
  nlsRevertExcludeMessage: 'distRevertExcludeMessage',
});

const CloneDialog = declare([ListDialogMixin], {
  maxWidth: 800,
  title: 'temporary',
  open(params) {
    const datasetEntry = params.row.entry;
    const dialogs = registry.get('dialogs');
    const confirmMessage = this.list.nlsSpecificBundle.cloneDatasetQuestion;
    dialogs.confirm(confirmMessage, null, null, (confirm) => {
      if (!confirm) {
        return;
      }
      const nds = createEntry(null, 'dcat:Dataset');
      const nmd = datasetEntry.getMetadata().clone()
        .replaceURI(datasetEntry.getResourceURI(), nds.getResourceURI());
      return registry.get('getGroupWithHomeContext')(nds.getContext()).then((groupEntry) => {
        const ei = nds.getEntryInfo();
        const acl = ei.getACL(true);
        acl.admin.push(groupEntry.getId());
        ei.setACL(acl);
      }).then(() => {
        nds.setMetadata(nmd);
        const title = nmd.findFirstValue(null, 'dcterms:title') || '';
        nmd.findAndRemove(null, 'dcterms:title');
        nmd.findAndRemove(null, 'dcat:distribution');
        const copyString = this.list.nlsSpecificBundle.cloneCopy;
        nmd.addL(nds.getResourceURI(), 'dcterms:title', copyString + title);
        return nds.commit().then((newEntry) => {
          this.list.getView().addRowForEntry(newEntry);
          return registry.get('entrystoreutil')
            .getEntryByType('dcat:Catalog', newEntry.getContext()).then((catalog) => {
              catalog.getMetadata().add(catalog.getResourceURI(), 'dcat:dataset', newEntry.getResourceURI());
              return catalog.commitMetadata().then(() => {
                newEntry.setRefreshNeeded();
                return newEntry.refresh();
              });
            });
        });
      });
    });
  },
});
export default declare([ETBaseList], {
  createAndRemoveDistributions: true,
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  nlsApiExistsToUnpublishDataset: 'apiExistsToUnpublishDataset',
  nlsBundles: [{ escoList }, { escaDataset }],
  entitytype: 'dataset',
  entryType: ns.expand('dcat:Dataset'),
  rowClass: DatasetRow,
  listViewClass: ListView,
  class: 'datasets',
  searchVisibleFromStart: false,
  rowClickDialog: 'edit',
  versionExcludeProperties: ['dcat:distribution'],
  rowActionNames: ['edit', 'versions', 'preview', 'downgrade', 'comment',
    'distributionCreate', 'showresults', 'showideas', 'clone',
    'remove'],
  postCreate() {
    this.registerDialog('distributionEdit', EditDistributionDialog);
    this.registerDialog('distributionVersions', DistVersionDialog);
    this.registerDialog('manageFiles', ManageFiles);
    this.registerDialog('replaceFile', FileReplaceDialog);


    this.registerRowAction({
      name: 'preview',
      button: 'default',
      icon: 'eye',
      iconType: 'fa',
      nlsKey: 'previewDatasetTitle',
      nlsKeyTitle: 'previewDatasetTitle',
    });

    if (this.createAndRemoveDistributions) {
      this.registerDialog('distributionCreate', CreateDistribution);
      this.registerRowAction({
        name: 'distributionCreate',
        button: 'default',
        icon: 'plus',
        iconType: 'fa',
        first: true,
        noMenu: true,
        nlsKey: 'addDistributionTitle',
        nlsKeyTitle: 'addDistributionTitle',
      });
    }
    if (parseInt(config.catalog.datasetLimit, 10) === config.catalog.datasetLimit
      && !config.catalog.datasetLimitDialog) {
      this.createLimit = parseInt(config.catalog.datasetLimit, 10);
    }
    if (config.catalog.includeCandidates) {
      this.registerDialog('downgrade', DowngradeDialog);
      this.registerRowAction({
        name: 'downgrade',
        button: 'default',
        icon: 'level-down',
        iconType: 'fa',
        nlsKey: 'downgrade',
        nlsKeyTitle: 'downgradeTitle',
      });
    } else {
      this.rowActionNames.splice(this.rowActionNames.indexOf('downgrade'), 1);
    }
    this.registerDialog('comment', CommentDialog2);
    this.registerRowAction({
      name: 'comment',
      button: 'default',
      icon: 'comment',
      iconType: 'fa',
      nlsKey: 'commentMenu',
      nlsKeyTitle: 'commentMenuTitle',
    });

    if (config.catalog.includeShowcasesInDatasetMenu) {
      this.registerDialog('showresults', ShowResultsDialog);
      this.registerRowAction({
        name: 'showresults',
        button: 'default',
        icon: 'diamond',
        iconType: 'fa',
        nlsKey: 'showresults',
        nlsKeyTitle: 'showresultsTitle',
      });
    } else {
      this.rowActionNames.splice(this.rowActionNames.indexOf('showresults'), 1);
    }
    this.registerDialog('clone', CloneDialog);
    this.registerRowAction({
      name: 'clone',
      button: 'default',
      icon: 'clone',
      iconType: 'fa',
      nlsKey: 'cloneMenu',
      nlsKeyTitle: 'cloneMenuTitle',
    });
    if (config.catalog.includeIdeasInDatasetMenu) {
      this.registerDialog('showideas', ShowIdeasDialog);
      this.registerRowAction({
        name: 'showideas',
        button: 'default',
        icon: 'lightbulb-o',
        iconType: 'fa',
        nlsKey: 'showideas',
        nlsKeyTitle: 'showideasTitle',
      });
    } else {
      this.rowActionNames.splice(this.rowActionNames.indexOf('showideas'), 1);
    }

    this.includeSizeByDefault = config.get('catalog.includeListSizeByDefault', false);

    this.inherited('postCreate', arguments);
    // Overriding the default create dialog
    this.registerDialog('create', CreateDialog);
    checkAndRepairListener(this.getView());
  },

  show() {
    const esu = registry.get('entrystoreutil');
    esu.preloadEntries(ns.expand('dcat:Distribution'), registry.get('context')).then(() => {
      if (registry.get('context')) {
        this.render();
      }
      if (this.nlsGenericBundle) {
        this.updateLocaleStrings();
      }
    });
  },
  /**
   * @deprecated use corresponding method installActionOrNot.
   */
  installButtonOrNot(params, row) {
    if (params.name === 'export') {
      return row.entry.canReadMetadata();
    }
    return this.inherited(arguments);
  },

  installActionOrNot(params, row) {
    if (params.name === 'export') {
      return row.entry.canReadMetadata();
    } else if (params.name === 'preview') {
      return config.catalog != null && config.catalog.previewURL != null;
    } else if (params.name === 'remove') {
      return registry.get('hasAdminRights') || !row.entry.isPublic();
    }
    return this.inherited(arguments);
  },

  getTemplate() {
    return null;
/*    if (!this.template) {
      this.template = registry.get('itemstore').getItem(
        config.catalog.datasetTemplateId);
    }
    return this.template; */
  },

  getDistributionTemplate() {
    if (!this.dtemplate) {
      this.dtemplate = registry.get('itemstore').getItem(
        config.catalog.distributionTemplateId);
    }
    return this.dtemplate;
  },

  getSearchObject() {
    const context = registry.get('context');
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().rdfType(this.entryType).context(context.getResourceURI());
  },
});
