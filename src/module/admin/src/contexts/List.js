import {types} from 'store';
import NameDialog from 'admin/utils/NameDialog';
import ACLDialog from 'admin/utils/ACLDialog';
import registry from 'commons/registry';
import ContextRow from './ContextRow';
import BaseList from 'commons/list/common/BaseList';
import CreateDialog from './CreateDialog';
import config from 'config';
import escoList from 'commons/nls/escoList.nls';
import esadContext from 'admin/nls/esadContext.nls';
import declare from 'dojo/_base/declare';

const MakePremium = declare(null, {
  open(params) {
    const e = params.row.entry;
    e.setRefreshNeeded();
    e.refresh().then((entry) => {
      const ei = entry.getEntryInfo();
      const graph = ei.getGraph();
      graph.addL(entry.getResourceURI(), 'store:premium', 'premium');
      ei.commit().then(params.row.reRender.bind(params.row));
    });
  },
});

const UnMakePremium = declare(null, {
  open(params) {
    const e = params.row.entry;
    e.setRefreshNeeded();
    e.refresh().then((entry) => {
      const ei = entry.getEntryInfo();
      const graph = ei.getGraph();
      graph.findAndRemove(entry.getResourceURI(), 'store:premium');
      ei.commit().then(params.row.reRender.bind(params.row));
    });
  },
});

const ContextACLDialog = declare([ACLDialog], {
  nlsBundles: [{esadContext}],
  nlsHeaderTitle: 'contextACLHeader',
  nlsFooterButtonLabel: 'updateContextACLButton',
});

const ContextNameDialog = declare([NameDialog], {
  nlsBundles: [{esadContext}],
  lookUpPath: '_contexts?entryname=',
});

export default declare([BaseList], {
  nlsBundles: [{escoList}, {esadContext}],
  includeInfoButton: false,
  nlsRemoveEntryConfirm: 'removeProjectConfirm',
  rowClickDialog: 'edit',
  rowClass: ContextRow,
  rowActionNames: ['edit', 'versions', 'share', 'makepremium', 'unmakepremium', 'remove'],

  postCreate() {
    this.registerDialog('share', ContextACLDialog);
    if (config.admin && config.admin.showContextName === true) {
      this.registerDialog('name', ContextNameDialog);
      this.registerRowAction({
        name: 'name',
        button: 'default',
        icon: 'tag',
        iconType: 'fa',
        nlsKey: 'contextName',
      });
      this.rowActionNames.splice(2, 0, 'name');
    }

    this.registerRowAction({
      name: 'share',
      button: 'default',
      icon: 'key',
      iconType: 'fa',
      nlsKey: 'contextACL',
    });
    this.registerRowAction({
      name: 'makepremium',
      button: 'default',
      icon: 'level-up',
      iconType: 'fa',
      nlsKey: 'makePremium',
    });
    this.registerRowAction({
      name: 'unmakepremium',
      button: 'default',
      icon: 'level-down',
      iconType: 'fa',
      nlsKey: 'unmakePremium',
    });
    this.registerDialog('makepremium', MakePremium);
    this.registerDialog('unmakepremium', UnMakePremium);

    this.inherited('postCreate', arguments);
    this.registerDialog('create', CreateDialog);
    this.dialogs.edit.levels.setIncludeLevel('recommended');
  },

  showStopSign() {
    return !registry.get('hasAdminRights');
  },

  installActionOrNot(params, row) {
    const premiumContextEnabled = config.entrystore.premiumContexts === true;
    const isPremiumNow = row.entry.getEntryInfo().getGraph()
      .findFirstValue(null, 'store:premium') === 'premium';
    switch (params.name) {
      case 'makepremium':
        return premiumContextEnabled && !isPremiumNow;
      case 'unmakepremium':
        return premiumContextEnabled && isPremiumNow;
      default:
        return this.inherited(arguments);
    }
  },

  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem('esc:Context');
    }
    return this.template;
  },
  getSearchObject() {
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().entryType(types.ET_LOCAL)
      .graphType(types.GT_CONTEXT)
      .resourceType('InformationResource');// types.RT_INFORMATIONRESOURCE);
  },
  canShowView() {
    return new Promise(r => r(registry.get('hasAdminRights')));
  },
});
