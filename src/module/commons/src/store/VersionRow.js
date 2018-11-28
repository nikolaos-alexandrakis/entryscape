import ExpandRow from 'commons/list/common/ExpandRow';
import registry from 'commons/registry';
import dateUtil from 'commons/util/dateUtil';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import { Presenter } from 'rdforms';
import DOMUtil from '../util/htmlUtil';

export default declare([ExpandRow], {
  constructor() {
    this.compact = true;
    this.showCol3 = false;
  },

  postCreate() {
    this.revURI = this.entry.uri; // Hack to reuse EntryRow code
    this.currentRevision = this.list.entry.getEntryInfo().getGraph().findFirstValue(this.revURI, 'owl:sameAs') != null;
    this.inherited(arguments);
  },

  getPreviousRevision() {
    const entry = this.list.entry;
    const revs = entry.getEntryInfo().getMetadataRevisions();
    let currentRevFound = false;
    return revs.find((el) => {
      if (el.uri === this.revURI) {
        currentRevFound = true;
      } else if (currentRevFound) {
        return true;
      }
      return false;
    });
  },

  initExpandArea(node) {
    const entry = this.list.entry;
    const ei = entry.getEntryInfo();
    ei.getMetadataRevisionGraph(this.revURI).then((graph) => {
      this.graph = graph;
      const prev = this.getPreviousRevision();
      if (prev) {
        ei.getMetadataRevisionGraph(prev.uri).then((prevGraph) => {
          this.renderExpandArea(node, entry.getMetadata(), graph, prevGraph);
        });
      } else {
        this.renderExpandArea(node, entry.getMetadata(), graph);
      }
    });
  },

  renderExpandArea(node, currentGraph, revisionGraph, prevRevisionGraph) {
    const presenterNode = DOMUtil.create('div', null, node);
    presenterNode.style.padding = '0px 0px 10px 15px';

    const p = new Presenter({ compact: this.compact }, presenterNode);
    const template = this.list.getTemplate();
    const entry = this.list.entry;
    const dialog = this.list.dialog;
    let disClass = '';
    let revertTitle = dialog.getRevertTitle();

    // Is this the current revision?
    if (this.currentRevision) {
      disClass = 'disabled';
      revertTitle = dialog.getCurrentRevisionRevertTitle();
    } else if (dialog.isSimilar(currentGraph, revisionGraph)) {
      if (dialog.hasExcludeDiff(currentGraph, revisionGraph)) {
        // Some change is there in the excluded properties
        disClass = 'disabled';
        revertTitle = dialog.getNoRevertSameGraphExcludeTitle();
      } else {
        // No change to currentGraph
        disClass = 'disabled';
        revertTitle = dialog.getNoRevertSameGraphTitle();
      }
    }

    // Check if the change to previous graph is in the excluded properties
    if (prevRevisionGraph != null && dialog.hasExcludeDiff(revisionGraph, prevRevisionGraph)) {
      DOMUtil.create('div', {
        class: 'alert alert-info',
      }, node)
        .innerHTML = dialog.getReasonForRevisionMessage();
    }

    const b = this.nlsSpecificBundle;
    const buttonRow = DOMUtil.create('div', null, node);
    buttonRow.style['min-height'] = '60px';

    const button = DOMUtil.create('button', {
      type: 'button',
      class: `pull-right btn btn-primary btn--revert ${disClass}`,
      title: revertTitle,
      innerHTML: '<span class="fa fa-level-up"></span>' +
        `&nbsp;<span>${b.revertLabel}</span>`,
    }, buttonRow);
    button.style['pointer-events'] = 'visible';

    if (disClass === '') {
      button.onclick = this.revert.bind(this);
    }

    this.details.firstChild.style['border-top'] = '0px';
    this.detailsContainer.style.padding = '15px';

    p.show({ resource: entry.getResourceURI(), graph: revisionGraph, template });
  },

  getRenderNameHTML() {
    const e = this.entry.user;
    const rdfutils = registry.get('rdfutils');
    const username = e.getEntryInfo().getName()
      || (e.getResource(true) && e.getResource(true).getName());
    const name = rdfutils.getLabel(e) || username;
    let date = dateUtil.getMultipleDateFormats(this.entry.time);
    date = `${date.dateMedium} ${date.timeMedium}`;
    const b = this.nlsSpecificBundle;
    const current = this.currentRevision ? b.currentRevision : '';
    if (name == null && username == null) {
      // return i18n.localize(b, 'noUserNameRevision', {datetime: date, id: e.getId()}) + current;
      // @scazan: I am assuming that this.nlsSpecificBundle is a localized bundle already
      return i18n.renderNLSTemplate(b.noUserNameRevision, { datetime: date, id: e.getId() }) + current;
    }
    return `${date}, ${name} ${current}`;
  },

  revert() {
    this.list.dialog.revert(this.list.entry, this.graph);
  },
});
