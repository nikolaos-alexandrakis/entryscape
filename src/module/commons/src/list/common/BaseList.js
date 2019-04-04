import escoList from 'commons/nls/escoList.nls';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import List from '../List';
import CreateDialog from './CreateDialog';
import EditDialog from './EditDialog';
import PresentDialog from './PresentDialog';
import RemoveDialog from './RemoveDialog';
import VersionsDialog from './VersionsDialog';

export default declare([List, NLSMixin.Dijit], {
  nlsBundles: [{ escoList }],
  entryType: '',
  /**
   * @deprecated assumed to be the number two in the nlsBundles list.
   */
  specificNLSBundleName: '__none',
  includeInfoButton: true,
  includeEditButton: true,
  includeRemoveButton: true,
  includeCreateButton: true,
  includeVersionsButton: true,
  createLimit: -1,
  includeRefreshButton: true,
  nlsRemoveFailedKey: 'removeEntryFailed',
  nlsInfoEntryTitle: 'infoEntry',
  nlsInfoEntryLabel: 'infoEntry',
  nlsEditEntryTitle: 'editEntry',
  nlsEditEntryLabel: 'editEntry',
  nlsRemoveEntryTitle: 'removeEntryTitle',
  nlsRemoveEntryLabel: 'removeEntryLabel',
  nlsRemoveEntryConfirm: 'removeEntryConfirm',
  nlsCreateEntryLabel: 'createButtonLabel',
  nlsCreateEntryTitle: 'createPopoverTitle',
  nlsCreateEntryMessage: 'createPopoverMessage',
  nlsVersionsLabel: 'versionsLabel',
  nlsVersionsTitle: 'versionsTitle',
  nlsRemoveAllEntires: 'removeAllEntries',

  postCreate() {
    this.registerDialog('info', PresentDialog);
    this.registerDialog('edit', EditDialog);
    this.registerDialog('remove', RemoveDialog);
    this.registerDialog('create', CreateDialog);
    this.registerDialog('versions', VersionsDialog);

    if (this.includeInfoButton) {
      this.registerRowAction({
        name: 'info',
        button: 'default',
        iconType: 'fa',
        icon: 'info-circle', //
        nlsKey: this.nlsInfoEntryLabel,
        nlsKeyTitle: this.nlsInfoEntryTitle,
      });
    }

    if (this.includeEditButton) {
      this.registerRowAction({
        name: 'edit',
        button: 'default',
        iconType: 'fa',
        icon: 'pencil-alt',
        nlsKey: this.nlsEditEntryLabel,
        nlsKeyTitle: this.nlsEditEntryTitle,
      });
    }
    if (this.includeVersionsButton) {
      this.registerRowAction({
        name: 'versions',
        button: 'default',
        icon: 'bookmark',
        iconType: 'fa',
        nlsKey: this.nlsVersionsLabel,
        nlsKeyTitle: this.nlsVersionsTitle,
      });
    }
    if (this.includeRemoveButton) {
      this.registerRowAction({
        name: 'remove',
        button: 'danger',
        iconType: 'fa',
        icon: 'times',
        nlsKey: this.nlsRemoveEntryLabel,
        nlsKeyTitle: this.nlsRemoveEntryTitle,
      });
    }

    if (this.includeCreateButton) {
      this.registerListAction({
        name: 'create',
        button: 'success',
        icon: 'plus',
        iconType: 'fa',
        max: this.createLimit,
        disableOnSearch: false,
        nlsKey: this.nlsCreateEntryLabel,
        nlsKeyTitle: this.nlsCreateEntryTitle,
        nlsKeyMessage: this.nlsCreateEntryMessage,
      });
    }

    this.inherited('postCreate', arguments);
    if (this.nlsBundles.length > 1) {
      this.specificNLSBundleName = this.nlsBundles[1];
    }
  },
  /**
   * @deprecated use corresponding method installActionOrNot.
   */
  installButtonOrNot(params, row) {
    return this.installActionOrNot(params, row);
  },

  installActionOrNot(params, row) {
    switch (params.name) {
      case 'edit':
        return row.entry.canWriteMetadata();
      case 'remove':
        return row.entry.canAdministerEntry();
      case 'info':
        return row.entry.canReadMetadata();
      case 'versions':
        return row.entry.getEntryInfo().hasMetadataRevisions();
      default:
        return true;
    }
  },
  localeChange() {
    this.updateLocaleStrings(this.NLSBundle0, this.NLSBundle1);
  },
  getName() {
    if (this.NLSBundle1) {
      return this.NLSBundle1.createEntryName ? this.NLSBundle1.createEntryName
        : this.NLSBundle0.createEntryName;
    }

    return '';
  },
  rowMetadataUpdated(row) {
    row.render();
  },
  getEntityConfig(/* entry */) {
  },
  getTemplate(/* entry */) {
    console.error('Method must be overridden');
  },
  getTemplateLevel() {
    return 'mandatory';
  },
  getSearchObject() {
    const query = registry.get('entrystore').newSolrQuery();
    if (this.entryType) {
      return query.rdfType(this.entryType);
    }
    return query;
  },
});
