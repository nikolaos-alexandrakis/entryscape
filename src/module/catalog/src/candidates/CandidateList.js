import registry from 'commons/registry';
import ETBaseList from 'commons/list/common/ETBaseList';
import ProgressDialog from 'commons/progress/ProgressDialog';
import escoList from 'commons/nls/escoList.nls';
import escaCandidates from 'catalog/nls/escaCandidates.nls';
import config from 'config';
import declare from 'dojo/_base/declare';
import ListView from '../utils/ListView';
import CandidateRow from './CandidateRow';
import UpgradeDialog from './UpgradeDialog';
import CandidateOverview from './views/Overview';
import MithrilView from 'commons/view/MithrilView';

const ns = registry.get('namespaces');

export default declare(MithrilView, {
  mainComponent: () => ({
    view() {
      return <CandidateOverview />;
    },
  }),
});

export const view = declare([ETBaseList], {
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  nlsBundles: [{ escoList }, { escaCandidates }],
  entitytype: 'candidate',
  entryType: ns.expand('esterms:CandidateDataset'),
  nlsCreateEntryLabel: 'createCandidate',
  nlsCreateEntryTitle: 'createCandidatePopoverTitle',
  nlsCreateEntryMessage: 'createCandidatePopoverMessage',
  class: 'candidatedataset',
  listViewClass: ListView,
  rowClass: CandidateRow,
  searchVisibleFromStart: false,
  // Versions explicitly excluded since the support for checklist is not in metadata
  rowActionNames: ['edit', 'upgrade', 'progress', 'comment', 'remove'],
  rowClickDialog: 'progress',

  postCreate() {
    this.registerDialog('progress', ProgressDialog);
    this.registerDialog('upgrade', UpgradeDialog);
    this.registerDialog('comment', CommentDialog2);
    this.registerRowAction({
      name: 'progress',
      button: 'default',
      icon: 'check-square',
      iconType: 'fa',
      nlsKey: 'progressMenu',
      nlsKeyTitle: 'progressTitle',
    });
    this.registerRowAction({
      name: 'upgrade',
      button: 'default',
      icon: 'level-up-alt',
      iconType: 'fa',
      nlsKey: 'upgrade',
      nlsKeyTitle: 'upgradeTitle',
    });
    this.registerRowAction({
      name: 'comment',
      button: 'default',
      icon: 'comment',
      iconType: 'fa',
      nlsKey: 'commentMenu',
      nlsKeyTitle: 'commentMenuTitle',
    });
    this.inherited('postCreate', arguments);
    this.registerDialog('create', CreateDialog);
    this.dialogs.create.levels.setIncludeLevel('optional');
  },

  show() {
    const self = this;
    const esu = registry.get('entrystoreutil');
    esu.preloadEntries(ns.expand('esterms:CandidateDataset'), null).then(self.render());
  },
  getSearchObject() {
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().rdfType(ns.expand('esterms:CandidateDataset'))
      .context(registry.get('context'));
  },
  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem(config.catalog.datasetCandidateTemplateId);
    }
    return this.template;
  },
  getTemplateLevel() {
    return 'recommended';
  },
});
