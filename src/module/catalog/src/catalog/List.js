import MemberDialog from 'admin/groups/MemberDialog';
import escaCatalog from 'catalog/nls/escaCatalog.nls';
import Export from 'commons/export/Export';
import GCERow from 'commons/gce/GCERow';
import List from 'commons/gce/List';
import escoList from 'commons/nls/escoList.nls';
import registry from 'commons/registry';
import config from 'config';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import CreateDialog from './CreateDialog';
import EmbedDialog from './EmbedDialog';

const ns = registry.get('namespaces');

const ExportDialog = declare([Export], {
  nlsBundles: [{ escaCatalog }],
  nlsHeaderTitle: 'catalogExportLabel',
  title: 'temporary', // to avoid exception
  profile: 'dcat',
  open(params) {
    const name = registry.get('rdfutils').getLabel(params.row.entry);
    this.title = i18n.renderNLSTemplate(
      this.list.nlsSpecificBundle.catalogExportLabel,
      { name },
    );
    this.localeChange();
    this.inherited(arguments);
  },
});

const Row = declare([GCERow], {
  postCreate() {
    this.inherited('postCreate', arguments);
  },
  allowToggle() {
    if (config.catalog && config.catalog.disallowCatalogPublishingDialog != null
        && !registry.get('hasAdminRights')) {
      registry.get('dialogs').restriction(config.catalog.disallowCatalogPublishingDialog);
      return false;
    }

    return true;
  },
  getApiDistributionsSize() {
    const co = this.getContext();
    const es = co.getEntryStore();
    return es.newSolrQuery().context(es.getContextById(this.getContext().getId()))
      .rdfType('dcat:Distribution').uriProperty('dcterms:source', '*')
      .limit(1)
      .list()
      .getEntries();
  },
  unpublishCatalog(contextEntry, onSuccess) {
    const ei = contextEntry.getEntryInfo();
    const acl = ei.getACL(true);
    acl.rread = acl.rread || [];
    acl.rread.splice(acl.rread.indexOf('_guest'), 1);
    ei.setACL(acl);
    ei.commit().then(onSuccess);
  },
  toggleImpl(onSuccess) {
    const co = this.getContext();
    const es = co.getEntryStore();
    const dialogs = registry.get('dialogs');
    es.getEntry(co.getEntryURI(), { forceLoad: true })
      .then((contextEntry) => {
        if (!contextEntry.canAdministerEntry()) {
          dialogs.acknowledge(this.nlsSpecificBundle[this.nlsContextSharingNoAccess]);
          return;
        }
        let ei;
        let acl;
        if (this.isPublicToggle) {
          // check for api distributions using solr query dcterms:source
          this.getApiDistributionsSize().then((apiDistEntries) => {
            if (apiDistEntries.length === 0) {
              return this.unpublishCatalog(contextEntry, onSuccess);
            }
            const confirmMessage = this.nlsSpecificBundle[this.list.nlsApiExistsToUnpublishCatalog];
            return dialogs.confirm(confirmMessage, null, null, (confirm) => {
              if (confirm) {
                return this.unpublishCatalog(contextEntry, onSuccess);
              }
            });
          });
        } else {
          ei = contextEntry.getEntryInfo();
          acl = ei.getACL(true);
          acl.rread = acl.rread || [];
          acl.rread.push('_guest');
          ei.setACL(acl);
          ei.commit().then(onSuccess);
        }
      });
  },
  action_remove() {
    const dialogs = registry.get('dialogs');
    registry.get('getGroupWithHomeContext')(this.getContext())
      .then((group) => {
        // check for distribution Apis
        this.getApiDistributionsSize().then((apiDistEntries) => {
          if (apiDistEntries.length === 0) {
            dialogs.confirm(this.nlsSpecificBundle[this.nlsConfirmRemoveRow],
              null, null, (confirm) => {
                if (!confirm) {
                  return;
                }
                this.getContext().getEntry()
                  .then(hcEntry => hcEntry.del())
                  .then(() => group.del())
                  .then(() => {
                    this.list.getView().removeRow(this);
                    this.destroy();
                    const ue = registry.get('userEntry');
                    ue.setRefreshNeeded();
                    ue.refresh();
                  },
                  () => {
                    dialogs.acknowledge(this.nlsGenericBundle[this.nlsRemoveFailedKey]);
                  });
              });
          } else {
            dialogs.acknowledge(this.nlsSpecificBundle.confirmRemoveCatalogWithApiDistributions);
          }
        });
      });
  },
});

const CLMemberDialog = declare([MemberDialog.ListDialog], {
  open() {
    if (!registry.get('hasAdminRights')
        && config.catalog && config.catalog.disallowCatalogCollaborationDialog) {
      registry.get('dialogs').restriction(config.catalog.disallowCatalogCollaborationDialog);
    } else {
      this.inherited(arguments);
    }
  },
});

export default declare([List], {
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  includeExpandButton: false,
  nlsBundles: [{ escoList }, { escaCatalog }],
  rowClass: Row,

  nlsGCEPublicTitle: 'publicCatalogTitle',
  nlsGCEProtectedTitle: 'privateCatalogTitle',
  nlsGCESharingNoAccess: 'catalogSharingNoAccess',
  nlsGCEConfirmRemoveRow: 'confirmRemoveCatalog',
  nlsGroupSharingProblem: 'catalogSharingProblem',
  nlsApiExistsToUnpublishCatalog: 'apiExistsToUnpublishCatalog',
  rowClickView: 'catalog',
  entryType: ns.expand('dcat:Catalog'),
  contextType: 'esterms:CatalogContext',
  versionExcludeProperties: ['dcat:dataset'],

  rowActionNames: ['edit', 'versions', 'openMemberDialog', 'export', 'embed', 'remove'],

  postCreate() {
    this.registerDialog('export', ExportDialog);
    this.registerDialog('embed', EmbedDialog);
    this.registerDialog('openMemberDialog', CLMemberDialog);
    this.registerRowAction({
      first: true,
      name: 'export',
      button: 'default',
      icon: 'arrow-circle-o-down',
      iconType: 'fa',
      nlsKey: 'catalogExport',
      nlsKeyTitle: 'catalogExportTitle',
    });
    if (config.catalog && config.catalog.includeEmbeddOption) {
      this.registerRowAction({
        first: true,
        name: 'embed',
        button: 'default',
        icon: 'code',
        iconType: 'fa',
        nlsKey: 'catalogEmbed',
        nlsKeyTitle: 'catalogEmbedTitle',
      });
    } else {
      this.rowActionNames.splice(this.rowActionNames.indexOf('embed'), 1);
    }
    this.registerRowAction({
      first: true,
      name: 'openMemberDialog',
      button: 'default',
      icon: 'users',
      iconType: 'fa',
      nlsKey: 'catalogMember',
      nlsKeyTitle: 'catalogMemberTitle',
    });
    if (config.catalog
        && parseInt(config.catalog.catalogLimit, 10) === config.catalog.catalogLimit
        && !config.catalog.catalogLimitDialog) {
      this.createLimit = parseInt(config.catalog.catalogLimit, 10);
    }

    this.includeSizeByDefault = config.get('catalog.includeListSizeByDefault', false);

    this.inherited('postCreate', arguments);
    // Overriding the default create dialog
    this.registerDialog('create', CreateDialog);
  },

  show() {
    this.inherited(arguments);
    const buttons = this.getView().buttons;
    Object.keys(buttons).forEach((name) => {
      if (name === 'create') {
        const es = registry.get('entrystore');
        const adminRights = registry.get('hasAdminRights');
        const userEntry = registry.get('userEntry');
        const ccg = config.catalog.catalogCreationAllowedFor;
        const allowed = ccg === '_users' ? true :
          userEntry.getParentGroups().indexOf(es.getEntryURI('_principals', ccg)) >= 0;
        buttons[name].element.style.display = adminRights || allowed ? '' : 'none';
        this.includeCreateButton = adminRights || allowed;
      }
    });
  },

  getEmptyListWarning() {
    return this.NLSBundle1.emptyListWarning;
  },

  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem(config.catalog.catalogTemplateId);
    }
    return this.template;
  },
});
