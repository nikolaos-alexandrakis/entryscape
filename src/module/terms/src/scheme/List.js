import MemberDialog from 'admin/groups/MemberDialog';
import typeIndex from 'commons/create/typeIndex';
import Export from 'commons/export/Export';
import GCERow from 'commons/gce/GCERow';
import List from 'commons/gce/List';
import EditDialog from 'commons/list/common/EditDialog';
import escoList from 'commons/nls/escoList.nls';
import escoRdformsNLS from 'commons/nls/escoRdforms.nls';
import registry from 'commons/registry';
import config from 'config';
import declare from 'dojo/_base/declare';
import skosUtil from 'commons/tree/skos/util';
import { i18n } from 'esi18n';
import { namespaces } from 'rdfjson';
import esteScheme from 'terms/nls/esteScheme.nls';
import esteTerminologyExport from 'terms/nls/esteTerminologyexport.nls';
import CreateTerminologyDialog from './CreateTerminologyDialog';

const ns = registry.get('namespaces');

const ConceptSchemeEditDialog = declare(EditDialog, {
  async doneAction(graph) {
    const conceptSchemeEntry = this.row.entry;
    const oldNamespace = conceptSchemeEntry.getMetadata().findFirstValue(null, 'void:uriSpace');
    const newNamespace = graph.findFirstValue(null, 'void:uriSpace');
    if (!(newNamespace.endsWith('/') || newNamespace.endsWith('#'))) {
      graph.findAndReplaceObject(resourceURI, 'void:uriSpace', `${newNamespace}/`);
    }

    try {
      const async = registry.get('asynchandler');
      async.addIgnore('commitMetadata', async.codes.GENERIC_PROBLEM, true);

      // update mdatadata
      conceptSchemeEntry.setMetadata(graph);
      await conceptSchemeEntry.commitMetadata();
      this.list.rowMetadataUpdated(this.row);

      // update ruri if needed
      if (newNamespace !== oldNamespace) {
        await skosUtil.updateConceptSchemeRURI(conceptSchemeEntry, newNamespace);
      }
    } catch (err) {
      console.log(err);
      // something went wrong with committing metadata
      if (err.response.status === 412) {
        const escoRdforms = i18n.getLocalization(escoRdformsNLS);
        return registry.get('dialogs')
          .confirm(
            escoRdforms.metadataConflictMessage,
            escoRdforms.metadataConflictLoadChanges,
            escoRdforms.metadataConflictCancel)
          .then(() => {
            self.refreshEntry(conceptSchemeEntry);
            throw escoRdforms.metadataConflictRefreshMessage;
          }, () => {
            throw escoRdforms.metadataConflictRemainMessage;
          });
      }
      throw err;
    }

    // update the object uri for the concept entries skos:inScheme triple
    if (newNamespace !== oldNamespace) {
      return registry.get('dialogs').confirm('Shall we update all concepts?', null, null, (confirm) => {
        // progress dialog

        // first change concept scheme ruri

        // get all inScheme concepts

        // keep all their localnames but change their namespace
        registry.getEntryStore()
          .newSolrQuery()
          // .context()?
          .uriProperty('skos:inScheme', newNamespace) // it's newNamespace because we updated already "updateConceptSchemeRURI"
          .forEach((conceptEntry) => {
            if (confirm) {
              const { localname } = namespaces.nsify(conceptEntry.getResourceURI());
              skosUtil.updateConceptResourceURI(conceptEntry, newNamespace + localname);
            }
          });
      });
    }

    return Promise.resolve(); // to provide consistent returns
  },
});

const ExportDialog = declare([Export], {
  nlsBundles: [{ esteTerminologyExport }],
  nlsHeaderTitle: 'exportHeaderLabel',
  title: 'temporary', // to avoid exception
  profile: 'conceptscheme',
  open(params) {
    const name = registry.get('rdfutils').getLabel(params.row.entry);
    this.title = i18n.renderNLSTemplate(this.NLSLocalized0.exportHeaderLabel, { name });
    this.localeChange();
    this.inherited(arguments);
  },
});

const TLMemberDialog = declare([MemberDialog.ListDialog], {
  open() {
    if (!registry.get('hasAdminRights')
      && config.terms && config.terms.disallowTermCollaborationDialog) {
      registry.get('dialogs').restriction(config.terms.disallowTermCollaborationDialog);
    } else {
      this.inherited(arguments);
    }
  },
});

const Row = declare([GCERow], {
  allowToggle() {
    if (config.catalog && config.terms.disallowSchemePublishingDialog != null
      && !registry.get('hasAdminRights')) {
      registry.get('dialogs').restriction(config.terms.disallowSchemePublishingDialog);
      return false;
    }

    return true;
  },
});

export default declare([List], {
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  includeExpandButton: false,
  nlsBundles: [{ escoList }, { esteScheme }],
  rowClass: Row,

  nlsGCEPublicTitle: 'publicSchemeTitle',
  nlsGCEProtectedTitle: 'privateSchemeTitle',
  nlsGCESharingNoAccess: 'schemeSharingNoAccess',
  nlsGCEConfirmRemoveRow: 'confirmRemoveScheme',
  nlsGroupSharingProblem: 'schemeSharingProblem',
  rowClickView: 'termsoptions',
  entryType: ns.expand('skos:ConceptScheme'),
  contextType: 'esterms:TerminologyContext',
  versionExcludeProperties: ['skos:hasTopConcept'],
  rowActionNames: ['edit', 'versions', 'export', 'members', 'remove'],

  postCreate() {
    this.registerDialog('members', TLMemberDialog);

    this.registerRowButton({
      first: true,
      name: 'members',
      button: 'default',
      icon: 'users',
      iconType: 'fa',
      nlsKey: 'schemeMemberTitle',
    });
    this.registerDialog('export', ExportDialog);
    this.registerRowAction({
      first: true,
      name: 'export',
      button: 'default',
      icon: 'arrow-circle-down',
      iconType: 'fa',
      nlsKey: 'collectionExportTitle',
    });
    this.inherited('postCreate', arguments);
    this.registerDialog('create', CreateTerminologyDialog);
    this.registerDialog('edit', ConceptSchemeEditDialog);
  },

  getEmptyListWarning() {
    return this.NLSLocalized1.emptyListWarning;
  },

  getTemplate() {
    if (!this.template) {
      const conf = typeIndex.getConfByName('conceptscheme');
      this.template = registry.get('itemstore').getItem(conf.template);
    }
    return this.template;
  },
  onLimit() {
    if (!registry.get('hasAdminRights')
      && config.terms
      && parseInt(config.terms.schemeLimit, 10) === config.terms.schemeLimit
      && config.terms.schemeLimitDialog) {
      let exception = false;
      const premiumGroupId = config.entrystore.premiumGroupId;
      if (premiumGroupId) {
        const es = registry.get('entrystore');
        const groups = registry.get('userEntry').getParentGroups();
        exception =
          groups.some(groupEntryURI => es.getEntryId(groupEntryURI) === premiumGroupId);
      }

      if (!exception &&
        this.getView().getSize() >= parseInt(config.terms.schemeLimit, 10)) {
        registry.get('dialogs').restriction(config.terms.schemeLimitDialog);
        return true;
      }
    }
    return false;
  },
});
