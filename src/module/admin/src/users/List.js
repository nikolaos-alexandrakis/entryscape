import registry from 'commons/registry';
import { types } from 'store';
import ACLDialog from 'admin/utils/ACLDialog';
import BaseList from 'commons/list/common/BaseList';
import config from 'config';
import EditDialog from 'commons/list/common/EditDialog';
import escoList from 'commons/nls/escoList.nls';
import esadUser from 'admin/nls/esadUser.nls';
import declare from 'dojo/_base/declare';
import UserRow from './UserRow';
import CreateDialog from './CreateDialog';
import GroupDialog from './GroupDialog';
import PasswordDialog from './PasswordDialog';
import UsernameDialog from './UsernameDialog';
import CustomPropertiesDialog from './CustomPropertiesDialog';

const UserACLDialog = declare([ACLDialog], {
  nlsBundles: [{ esadUser }],
  nlsHeaderTitle: 'userACLHeader',
  nlsFooterButtonLabel: 'updateUserACLButton',
});

const UserEditDialog = declare([EditDialog], {
  doneAction(graph) {
    const userEntry = this.row.entry;
    const userRURI = userEntry.getResourceURI();
    const firstname = graph.findFirstValue(userRURI, 'foaf:givenName');
    const lastname = graph.findFirstValue(userRURI, 'foaf:familyName');
    graph.findAndRemove(null, 'foaf:name');
    graph.addL(userRURI, 'foaf:name', `${firstname} ${lastname}`);
    this.inherited(arguments);
  },
});

const f = (params, add) => {
  const es = registry.get('entrystore');
  const premiumGID = config.entrystore && config.entrystore.premiumGroupId;
  const pgURI = es.getEntryURI('_principals', premiumGID);
  if (es.getCache().get(pgURI) == null) {
    const async = registry.get('asynchandler');
    async.addIgnore('getEntry', async.codes.GENERIC_PROBLEM, true);
  }
  es.getEntry(pgURI).then(null,
    () => es.newGroup(premiumGID, premiumGID).commit()).then((pgentry) => {
    pgentry.getResource(true)[add ? 'addEntry' : 'removeEntry'](params.row.entry).then(() => {
      params.row.entry.setRefreshNeeded();
      return params.row.entry.refresh();
    }).then(params.row.reRender.bind(params.row));
  });
};

const MakePremium = declare(null, {
  open(params) {
    f(params, true);
  },
});

const UnMakePremium = declare(null, {
  open(params) {
    f(params, false);
  },
});

export default declare([BaseList], {
  nlsBundles: [{ escoList }, { esadUser }],
  includeInfoButton: false,
  rowClickDialog: 'edit',
  rowClass: UserRow,
  rowActionNames: ['edit', 'versions', 'username', 'password',
    'share', 'groups', 'statusEnable', 'statusDisable', 'makepremium', 'unmakepremium', 'remove'],

  postCreate() {
    this.registerDialog('groups', GroupDialog);
    this.registerDialog('share', UserACLDialog);
    this.registerDialog('password', PasswordDialog);
    this.registerDialog('username', UsernameDialog);
    this.registerDialog('properties', CustomPropertiesDialog);
    this.registerRowAction({
      first: true,
      name: 'groups',
      button: 'default',
      icon: 'users',
      iconType: 'fa',
      nlsKey: 'groupsList',
    });
    this.registerRowAction({
      name: 'share',
      button: 'default',
      icon: 'key',
      iconType: 'fa',
      nlsKey: 'userACL',
    });

    this.registerRowAction({
      name: 'statusEnable',
      button: 'default',
      icon: 'user-plus',
      iconType: 'fa',
      nlsKey: 'userStatusEnable',
    });

    this.registerRowAction({
      name: 'statusDisable',
      button: 'default',
      icon: 'user-times',
      iconType: 'fa',
      nlsKey: 'userStatusDisable',
    });

    this.registerRowAction({
      name: 'password',
      button: 'default',
      icon: 'unlock',
      iconType: 'fa',
      nlsKey: 'setPassword',
    });
    this.registerRowAction({
      name: 'username',
      button: 'default',
      icon: 'tag',
      iconType: 'fa',
      nlsKey: 'changeUsername',
    });
    if (config && config.site && registry.getSiteConfig().nationalIdNumber) {
      this.registerRowAction({
        name: 'properties',
        button: 'default',
        icon: 'th-list',
        iconType: 'fa',
        nlsKey: 'customProperties',
      });
    }
    this.registerRowAction({
      name: 'makepremium',
      button: 'default',
      icon: 'level-up',
      iconType: 'fa',
      nlsKey: 'addToPremiumGroup',
    });
    this.registerRowAction({
      name: 'unmakepremium',
      button: 'default',
      icon: 'level-down',
      iconType: 'fa',
      nlsKey: 'removeFromPremiumGroup',
    });
    this.registerDialog('makepremium', MakePremium);
    this.registerDialog('disable', UnMakePremium);

    this.inherited('postCreate', arguments);
    this.registerDialog('create', CreateDialog);
    this.registerDialog('edit', UserEditDialog);
    this.dialogs.edit.levels.setIncludeLevel('recommended');
  },

  showStopSign() {
    return !registry.get('hasAdminRights');
  },

  installActionOrNot(params, row) {
    const premiumGID = config.entrystore && config.entrystore.premiumGroupId;
    let isPremiumNow = false;
    if (premiumGID) {
      const premiumEURI = registry.get('entrystore').getEntryURI('_principals', premiumGID);
      isPremiumNow = row.entry.getParentGroups().indexOf(premiumEURI) >= 0;
    }
    switch (params.name) {
      case 'makepremium':
        return premiumGID != null && !isPremiumNow;
      case 'unmakepremium':
        return isPremiumNow;
      default:
        return this.inherited(arguments);
    }
  },

  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem('esc:User');
    }
    return this.template;
  },
  getSearchObject() {
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().entryType(types.ET_LOCAL)
      .graphType(types.GT_USER)
      .resourceType('InformationResource');// types.RT_INFORMATIONRESOURCE);
  },
  canShowView() {
    return new Promise(r => r(registry.get('hasAdminRights')));
  },
});
