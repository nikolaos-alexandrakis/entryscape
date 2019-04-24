import RDFEdit from 'commons/rdforms/RDFEdit';
import registry from 'commons/registry';
import config from 'config';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import { saveAs } from 'file-saver/FileSaver';
import { converters } from 'rdfjson';
import { validate } from 'rdforms';
import esreLoadDialog from 'registry/nls/esreLoadDialog.nls';
import esreSource from 'registry/nls/esreSource.nls';
import './esreSource.css';
import exampleRDF from './example';
import LoadDialog from './LoadDialog';
import template from './SourceTemplate.html';

const regroup = (a, p) => {
  const g = {};
  a.forEach((i) => {
    g[i[p]] = g[i[p]] || [];
    g[i[p]].push(i);
  });
  return g;
};

let doWarn = true;

const ns = registry.get('namespaces');
ns.add('dcat', 'http://www.w3.org/ns/dcat#');
export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  //= ==================================================
  // Public attributes
  //= ==================================================
  bid: 'esreSource',
  itemStore: null,
  type2template: null,
  rdfjson: null,
  rdfjsonEditorOpen: false,
  nlsBundles: [{ esreSource }, { esreLoadDialog }],

  //= ==================================================
  // Inherited attributes
  //= ==================================================
  templateString: template,

  //= ==================================================
  // Inherited methods
  //= ==================================================
  postCreate() {
    this.inherited('postCreate', arguments);

    this.loadDialog = new LoadDialog({}, this.loadDialogNode);
    // on(this.uploadButton, "click", lang.hitch(this.uploadDialog, "show"));

    this._rdfEditor = new RDFEdit({
      onRDFChange: this._onRDFChange.bind(this),
    }, this._rdfEditor);
    const tp = registry.onInit('itemstore').then((itemstore) => {
      const t2t = config.registry.type2template;
      this.type2template = {};
      Object.keys(t2t).forEach((cls) => {
        this.type2template[ns.expand(cls)] = itemstore.getItem(t2t[cls]);
      });
      this.mandatoryTypes = config.registry.mandatoryValidationTypes.map(mt => ns.expand(mt));
    });
    this.allInited = Promise.all([tp]);
  },
  show() {
    // TODO @scazan: verify with Matthias this.NLSLocalized
    this.allInited.then(() => {
      if (registry.get('userInfo').id === '_guest' && doWarn) {
        const registrySourceBundle = this.NLSLocalized.esreSource;
        registry.get('dialogs')
          .acknowledge(registrySourceBundle.signinRequirement, registrySourceBundle.signinRequirementOk);
        doWarn = false;
      }
      this._rdfEditor.startup();
      const graph = registry.get('clipboardGraph');
      this._rdfEditor.setRDF(graph || '<?xml version="1.0"?>\n' +
        '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n' +
        '</rdf:RDF>');
      this._onRDFChange();
    });
  },

  showRDF(rdf) {
    const report = this._rdfEditor.setRDF(rdf);
    registry.set('clipboardGraph', report.graph);
    this._onRDFChange();
  },
  //= ==================================================
  // Private methods
  //= ==================================================
  _onRDFChange() {
    const rdfReport = this._rdfEditor.getRDF();
    if (rdfReport.error) {
      this.viewReportState = false;
      this.updateMessage(rdfReport.error);
      return;
    }
    this.viewReportState = true;
    registry.set('clipboardGraph', rdfReport.graph);

    const validateReport =
      validate.graphReport(rdfReport.graph, this.type2template, this.mandatoryTypes);
    regroup(validateReport.resources, 'type');
    const validationResult = i18n.renderNLSTemplate(this.NLSLocalized.esreSource.validationMessage, {
      errors: validateReport.errors,
      warnings: validateReport.warnings,
    });
    if (validateReport.mandatoryError) {
      this.updateMessage(
        `${this.NLSLocalized.esreSource.mandatoryMissing}<ul><li>${validateReport.mandatoryError.join('</li><li>')}</li></ul>`, validationResult);
    } else {
      this.updateMessage(null, validationResult);
    }
  },
  updateMessage(error, success) {
    this.message = [];
    if (error != null) {
      this.__error.style.display = '';
      this.__info.style.display = 'none';
      this.message.push(error);
      this.downloadButton.setAttribute('disabled', 'disabled');
    } else {
      this.__error.style.display = 'none';
      this.__info.style.display = '';
      this.downloadButton.removeAttribute('disabled');
    }
    if (success) {
      this.message.push(success);
    }
  },
  _infoClick() {
    registry.get('dialogs').acknowledge(this.message.join('<br>'));
  },
  _example() {
    this.showRDF(exampleRDF);
  },
  _download() {
    const graph = registry.get('clipboardGraph');
    const rdfxml = converters.rdfjson2rdfxml(graph);
    const blob = new Blob([rdfxml], { type: 'application/rdf+xml;charset=utf-8' });
    saveAs(blob, 'MergedCatalog.rdf', true);
  },
  _upload() {
    if (registry.get('userInfo').id === '_guest') {
      const b = this.NLSLocalized.esreSource;
      registry.get('dialogs').acknowledge(b.signinRequirement, b.signinRequirementOk);
    } else {
      this.loadDialog.show(this.showRDF.bind(this), this.NLSLocalized.esreLoadDialog);
    }
  },
});
