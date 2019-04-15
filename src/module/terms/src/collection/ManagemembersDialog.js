import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import utils from 'terms/utils';
import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import { i18n, NLSMixin } from 'esi18n';
import esteCollection from 'terms/nls/esteCollection.nls';
import declare from 'dojo/_base/declare';
import CollectionTree from './CollectionTree';

export default declare([TitleDialog, ListDialogMixin, NLSMixin.Dijit], {
  maxWidth: 800,
  nlsBundles: [{ esteCollection }],
  nlsHeaderTitle: 'manageMembersHeader',
  nlsFooterButtonLabel: 'manageMembersButton',

  postCreate() {
    this.inherited(arguments);
    this.collectionTree = new CollectionTree({}, htmlUtil.create('div', null, this.containerNode));
  },

  localeChange() {
    this.updateLocaleStrings(this.NLSBundles.esteCollection);
  },
  open(params) {
    this.row = params.row;
    this.collectionEntry = params.row.entry;
    this.showCollection();
    this.show();
    this.inherited(arguments);
  },

  showCollection() {
    const context = registry.get('context');
    registry.get('entrystoreutil').getEntryByType('skos:ConceptScheme', context)
      .then((csEntry) => {
        this.collectionTree.showEntry(csEntry, this.collectionEntry);
        this.collectionTree.model.checkChange = this.updateIfCheckChanged.bind(this);
      });
    this.lockFooterButton();
  },

  getCheckDelta() {
    const treeModel = this.collectionTree.getTreeModel();
    const cn = treeModel.checkedNodes;
    const ucn = treeModel.uncheckedNodes;
    let co = 0;

    co += Object.keys(cn).length;
    co += Object.keys(ucn).length;

    return co;
  },
  updateIfCheckChanged() {
    if (this.getCheckDelta() > 0) {
      this.unlockFooterButton();
    } else {
      this.lockFooterButton();
    }
  },
  conditionalHide() {
    const co = this.getCheckDelta();
    if (co === 0) {
      this.hide();
    } else {
      const b = this.NLSLocalized0;
      registry.get('dialogs').confirm(
        i18n.renderNLSTemplate(b.manageMemberAbortOrNot, co), b.discardMemberChanges, b.continueMemberChanges)
        .then((discard) => {
          if (discard) {
            this.hide();
          }
        });
    }
  },
  footerButtonAction() {
    const treeModel = this.collectionTree.getTreeModel();
    const checkedEntries = [];
    const uncheckedEntries = [];
    const checkedNodes = treeModel.checkedNodes;
    const uncheckedNodes = treeModel.uncheckedNodes;
    const collectionEntry = this.collectionEntry;
    const collectionURI = collectionEntry.getResourceURI();
    const mpromises = [];

    Object.keys(checkedNodes)
      .forEach(checkedNode => mpromises.push(treeModel.getEntry(checkedNode)
        .then(checkedEntry => checkedEntries.push(checkedEntry))));

    Object.keys(uncheckedNodes)
      .forEach(uncheckedNode => mpromises.push(treeModel.getEntry(uncheckedNode)
        .then(uncheckedEntry => uncheckedEntries.push(uncheckedEntry))));

    const self = this;
    Promise.all(mpromises).then(() => utils.isUnModified(
      checkedEntries.concat(uncheckedEntries, collectionEntry))
      .then(() => {
        const promises = [];
        checkedEntries.forEach((checkedEntry) => {
          const conceptURI = checkedEntry.getResourceURI();
          collectionEntry.getMetadata().add(collectionURI, 'skos:member', conceptURI);
          checkedEntry.getMetadata().add(conceptURI, 'dcterms:partOf', collectionURI);
          promises.push(checkedEntry.commitMetadata());
        });

        uncheckedEntries.forEach((uncheckedEntry) => {
          const conceptURI = uncheckedEntry.getResourceURI();
          collectionEntry.getMetadata().findAndRemove(collectionURI, 'skos:member', conceptURI);
          uncheckedEntry.getMetadata().findAndRemove(conceptURI, 'dcterms:partOf', collectionURI);
          promises.push(uncheckedEntry.commitMetadata());
        });
        if (promises.length > 0) {
          return Promise.all(promises).then(() => collectionEntry.commitMetadata().then(() => {
            self.row.render();
          }));
        }
        return Promise.all();
      }, () => {
        const b = self.NLSLocalized0;
        return registry.get('dialogs').acknowledge(b.concurrentConflictMessage,
          b.concurrentConflictOk).then(() => {
          self.showCollection();
          throw Error(b.concurrentConflictResolved);
        });
      }));
  },
});
