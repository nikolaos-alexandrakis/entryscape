import registry from 'commons/registry';
import List from 'commons/gce/List';
import MemberDialog from 'admin/groups/MemberDialog';
import escoList from 'commons/nls/escoList.nls';
import eswoSpaces from 'workbench/nls/eswoSpaces.nls';
import declare from 'dojo/_base/declare';
import CreateDialog from './CreateDialog';
import ConfigureEntityTypesDialog from './ConfigureEntityTypesDialog';

export default declare([List], {
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  includeExpandButton: false,
  nlsBundles: [{ escoList }, { eswoSpaces }],

  nlsGCEPublicTitle: 'publicWorkspaceTitle',
  nlsGCEProtectedTitle: 'privateWorkspaceTitle',
  nlsGCESharingNoAccess: 'workspaceSharingNoAccess',
  nlsGCEConfirmRemoveRow: 'confirmRemoveWorkspace',
  nlsGroupSharingProblem: 'workspaceSharingProblem',
  rowClickView: 'workbench__entities',
  contextType: 'esterms:WorkbenchContext',
  rowActionNames: ['edit', 'configure', 'members', 'versions', 'remove'], // removed 'graph'

  postCreate() {
    this.registerDialog('members', MemberDialog.ListDialog);
    this.registerRowButton({
      first: true,
      name: 'members',
      button: 'default',
      icon: 'users',
      iconType: 'fa',
      nlsKey: 'workspaceMemberTitle',
    });
    this.registerDialog('configure', ConfigureEntityTypesDialog);
    this.registerRowButton({
      first: true,
      name: 'configure',
      button: 'default',
      icon: 'wrench',
      iconType: 'fa',
      nlsKey: 'workspaceConfigure',
      nlsKeyTitle: 'workspaceConfigureTitle',
    });

    this.inherited('postCreate', arguments);
    this.registerDialog('create', CreateDialog);
  },

  installActionOrNot(params, row) {
    if (params.name === 'versions') {
      return row.entry.getEntryInfo().hasMetadataRevisions();
    }

    return false; // TODO check
  },

  getEmptyListWarning() {
    return this.NLSBundle1.emptyListWarning;
  },

  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore')
        .getItem('esc:Context');
    }
    return this.template;
  },
});
