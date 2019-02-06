import escoVersions from 'commons/nls/escoVersions.nls';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import TitleDialog from '../dialog/TitleDialog';
import DOMUtil from '../util/htmlUtil';
import VersionsList from './VersionsList';

export default declare([TitleDialog.ContentNLS], {
  nlsBundles: [{ escoVersions }],
  nlsHeaderTitle: 'versionsHeader',
  nlsFooterButtonLabel: 'versionsCloseButton',

  excludeProperties: [],
  template: null,

  postCreate() {
    this.dialog.containerNode.innerHTML = '';
    this.alertMessage = DOMUtil.create('div', {
      class: 'alert alert-info',
      role: 'alert',
    }, this.dialog.containerNode);
    this.alertMessage.style.display = 'none';

    this.versionList = new VersionsList({ dialog: this }, DOMUtil.create('div', null, this.dialog.containerNode));
    const ns = registry.get('namespaces');
    this.excludeProperties = this.excludeProperties.map(e => ns.expand(e));
    this.inherited(arguments);
  },

  show(entry, template) {
    this.entry = entry;
    this.versionList.show(entry, template);
    this.dialog.show();
  },
  revert(entry, graph) {
    const g = graph.clone();
    const b = this.NLSLocalized0;
    const re = this.revertExceptions(entry, g);

    registry.get('dialogs').confirm(b.revertMessage + re, b.revertConfirm, b.revertReject).then(() => {
      entry.setRefreshNeeded(true);
      entry.refresh().then(() => {
        entry.setMetadata(g);
        entry.commitMetadata().then(() => {
          this.versionList.search();
          this.list.rowMetadataUpdated(this.row);
        });
      });
    });
  },
  revertExceptions(entry, graph) {
    if (this.hasExcludeDiff(entry.getMetadata(), graph)) {
      this.preserveProps(entry.getMetadata(), graph);
      return this.getRevertExcludeMessage();
    }
    return '';
  },

  getRevertTitle() {
    return this.NLSBundle0.revertTitle;
  },
  getCurrentRevisionRevertTitle() {
    return this.NLSBundle0.currentRevisionRevertTitle;
  },

  getRevertExcludeMessage() {
    return '';
  },
  getReasonForRevisionMessage() {
    return '';
  },
  getNoRevertSameGraphExcludeTitle() {
    return '';
  },
  getNoRevertSameGraphTitle() {
    return this.NLSBundle0.noRevertSameGraphTitle;
  },
  hasExcludeDiff(graph1, graph2) {
    let diff = false;
    this.excludeProperties.forEach((p) => {
      graph2.find(null, p).forEach((stmt) => {
        if (graph1.find(stmt.getSubject(), stmt.getPredicate(), stmt.getObject()).length === 0) {
          diff = true;
        }
      });
      graph1.find(null, p).forEach((stmt) => {
        if (graph2.find(stmt.getSubject(), stmt.getPredicate(), stmt.getObject()).length === 0) {
          diff = true;
        }
      });
    });
    return diff;
  },
  getSignature(graph) {
    const signature = [];
    const exclude = new Set(this.excludeProperties);
    graph.find().forEach((statement) => {
      if (exclude.has(statement.getPredicate())) {
        return;
      }
      if (!statement.isSubjectBlank()) {
        signature.push(statement.getSubject());
      }
      signature.push(statement.getPredicate());
      if (statement.getType() !== 'bnode') {
        let val = statement.getValue();
        if (statement.getLanguage()) {
          val += `@${statement.getLanguage()}`;
        }
        if (statement.getDatatype()) {
          val += `^^${statement.getDatatype()}`;
        }
        signature.push(val);
      }
    });
    signature.sort();
    return signature;
  },
  isSimilar(graph1, graph2) {
    const exclude = new Set(this.excludeProperties);
    const sig1 = this.getSignature(graph1, exclude);
    const sig2 = this.getSignature(graph2, exclude);
    return !sig1.some((val, idx) => val !== sig2[idx]);
  },
  preserveProps(graph1, graph2) {
    this.excludeProperties.forEach((p) => {
      graph2.findAndRemove(null, p);
      graph1.find(null, p).forEach((stmt) => {
        graph2.add(stmt);
      });
    });
  },
});
