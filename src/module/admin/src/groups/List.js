import registry from 'commons/registry';
import config from 'config';
import { types } from 'store';
import ACLDialog from 'admin/utils/ACLDialog';
import NameDialog from 'admin/utils/NameDialog';
import BaseList from 'commons/list/common/BaseList';
import escoList from 'commons/nls/escoList.nls';
import esadGroup from 'admin/nls/esadGroup.nls';
import declare from 'dojo/_base/declare';
import MemberDialog from './MemberDialog';
import GroupRow from './GroupRow';
import CreateDialog from './CreateDialog';

const GroupACLDialog = declare([ACLDialog], {
  nlsBundles: [{ esadGroup }],
  nlsHeaderTitle: 'groupACLHeader',
  nlsFooterButtonLabel: 'updateGroupACLButton',
});

const GroupNameDialog = declare([NameDialog], {
  nlsBundles: [{ esadGroup }],
  lookUpPath: '_principals?entryname=',
});

export default declare([BaseList], {
  nlsBundles: [{ escoList }, { esadGroup }],
  includeInfoButton: false,
  rowClickDialog: 'edit',
  rowClass: GroupRow,
  rowActionNames: ['edit', 'versions', 'share', 'members', 'remove'],

  postCreate() {
    this.registerDialog('members', MemberDialog);
    this.registerDialog('share', GroupACLDialog);
    if (config.admin && config.admin.showGroupName === true) {
      this.registerDialog('name', GroupNameDialog);
      this.registerRowAction({
        name: 'name',
        button: 'default',
        icon: 'tag',
        iconType: 'fa',
        nlsKey: 'groupName',
      });
      this.rowActionNames.splice(2, 0, 'name');
    }
    this.registerRowAction({
      first: true,
      name: 'members',
      button: 'default',
      icon: 'users',
      iconType: 'fa',
      nlsKey: 'memberList',
    });
    this.registerRowAction({
      name: 'share',
      button: 'default',
      icon: 'key',
      iconType: 'fa',
      nlsKey: 'groupACL',
    });
    this.inherited('postCreate', arguments);
    this.registerDialog('create', CreateDialog);
    this.dialogs.edit.levels.setIncludeLevel('recommended');
  },

  showStopSign() {
    return !registry.get('hasAdminRights');
  },

  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem('esc:Group');
    }
    return this.template;
  },
  getSearchObject() {
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().entryType(types.ET_LOCAL)
      .graphType(types.GT_GROUP)
      .resourceType('InformationResource');// types.RT_INFORMATIONRESOURCE);
  },
  canShowView() {
    return new Promise(r => r(registry.get('hasAdminRights')));
  },
});
