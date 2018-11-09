import dateUtil from 'commons/util/dateUtil';
import { Editor, Presenter, validate } from 'rdforms';
import { Graph } from 'rdfjson';
import escoContentview from 'commons/nls/escoContentview.nls';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import { NLSMixin } from 'esi18n';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import DOMUtil from '../util/htmlUtil';
import templateString from './MetadataComponentTemplate.html';
import './escoMetadataComponent.css';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  templateString,
  nlsBundles: [{ escoContentview }, { escoRdforms }],
  bid: 'escoMetadataComponent',
  entry: null,
  template: null,
  presenterMode: true,

  postCreate() {
    if (this.presenterMode) {
      this.presenter = new Presenter({
        compact: false,
        filterTranslations: true,
      }, DOMUtil.create('div', null, this.__presenter.domNode));
      this.graph = this.entry.getMetadata();
      this.presenter.show({
        resource: this.entry.getResourceURI(),
        graph: this.graph,
        template: this.template,
      });
      const cDate = this.entry.getEntryInfo().getModificationDate();
      const mDateFormats = dateUtil.getMultipleDateFormats(cDate);// code change
      this.__dateNode.innerHTML = mDateFormats.short;// code
      this.viewMode();
    }
    registry.get('context').getEntry().then((contextEntry) => {
      if (contextEntry.canWriteResource()) {
        this.__deleteButtonNode.style.display = '';
        this.__editButtonNode.style.display = '';
        this.__saveButtonNode.style.display = '';
        this.__cancelButtonLabelNode.style.display = '';
      }
    });
    this.editor = new Editor({}, DOMUtil.create('div', null, this.__editorNode, true));
    this.inherited(arguments);
  },

  localeChange() {
    const bundle = this.NLSBundle1;
    this.discardWarning = bundle.discardMetadataChangesWarning;
    this.discardOption = bundle.discardMetadataChanges;
    this.keepOption = bundle.keepMetadataChanges;
    this.tooFewFields = bundle.tooFewFields;
  },
  show(graph, resourceURI) {
    this.editMode();
    const self = this;
    this.oldGraph = graph;
    this.graph = new Graph(graph.exportRDFJSON());
    this.lockSaveButton();
    this.graph.onChange = () => {
      // check individual field value and lock save accordingly
      self.unlockSaveButton();
    };
    this.editor.show({
      resource: resourceURI,
      graph: this.graph,
      template: this.template,
      compact: true,
    });
  },
  unlockSaveButton() {
    this.__saveButtonNode.classList.remove('disabled');
  },
  lockSaveButton() {
    this.__saveButtonNode.classList.add('disabled');
  },
  editSave(graph) {
    this.graph = graph;
    this.entry.setMetadata(graph);
    this.entry.commitMetadata().then(() => {
      this.presenter.show({
        resource: this.entry.getResourceURI(),
        graph,
        template: this.template,
      });
      this.viewMode();
    });
  },
  edit() {
    this.lockSaveButton();
    this.show(this.graph, this.entry.getResourceURI());
  },
  remove() {
    this.entry.del().then(() => {
      this.parent.renderViewComponents();
    });
  },
  updateUI(graph) {
    if (this.parentObj && !this.presenterMode) {
      this.parentObj.updateUI();
      return;
    }
    this.presenter.show({
      resource: this.entry.getResourceURI(),
      graph,
      template: this.template,
    });
    this.__presenter.style.display = 'block';
    this.__editorNode.style.display = 'none';
  },
  save() {
    const report = validate.bindingReport(this.editor.binding);
    if (report.errors.length > 0) {
      this.graph = new Graph(this.oldGraph.exportRDFJSON());
      this.editor.report(report);
      this.showErrorMessage(this.tooFewFields);
      return;
    }
    if (this.parentObj && !this.presenterMode) {
      this.parentObj.save(this.graph);
      return;
    }
    this.editSave(this.graph);
  },
  cancel() {
    if (!this.graph.isChanged()) {
      this.viewMode();
      this.updateUI();
      return;
    }
    const dialogs = registry.get('dialogs');
    dialogs.confirm(this.discardWarning, this.discardOption, this.keepOption,
      (discard) => {
        if (discard) {
          this.viewMode();
          this.graph = new Graph(this.oldGraph.exportRDFJSON());
          if (this.parentObj && !this.presenterMode) {
            this.parentObj.graph = new Graph(this.oldGraph.exportRDFJSON());
            this.parentObj.updateUI();
          }
        }
      });
  },
  closeErrorMessage() {
    this.errorMessageAlert.style.display = 'none';
  },

  showErrorMessage(message) {
    this.errorMessage.innerHTML = message;
    this.errorMessageAlert.style.display = '';
  },
  editMode() {
    this.__presenter.style.display = 'none';
    this.__editButtonNode.style.display = 'none';
    this.__deleteButtonNode.style.display = 'none';

    this.__editorNode.style.display = 'block';
    this.__saveButtonNode.style.display = 'block';
    this.__cancelButtonNode.style.display = 'block';
  },
  viewMode() {
    this.closeErrorMessage();
    this.__presenter.style.display = 'block';
    this.__editButtonNode.style.display = 'block';
    this.__deleteButtonNode.style.display = 'block';

    this.__editorNode.style.display = 'none';
    this.__saveButtonNode.style.display = 'none';
    this.__cancelButtonNode.style.display = 'none';
  },
});
