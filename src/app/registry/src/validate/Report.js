import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import templateString from './ReportTemplate.html';
import config from 'config'; // ./config/main.js
import ClassReport from './ClassReport';
import RDFormsValidateDialog from 'commons/rdforms/RDFormsValidateDialog';
import {validate} from 'rdforms';
import {i18n, NLSMixin} from 'esi18n';
import esreReport from 'registry/nls/esreReport.nls';
import esreSource from 'registry/nls/esreSource.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import './esreReport.css';

const regroup = (a, p) => {
  const g = {};
  a.forEach((i) => {
    g[i[p]] = g[i[p]] || [];
    g[i[p]].push(i);
  });
  return g;
};

const ns = registry.get('namespaces');
ns.add('dcat', 'http://www.w3.org/ns/dcat#');
export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  //= ==================================================
  // Public attributes
  //= ==================================================
  itemStore: null,
  type2template: null,
  rdfjson: null,
  rdfjsonEditorOpen: false,
  nlsBundles: [{esreReport}, {esreSource}],

  //= ==================================================
  // Inherited attributes
  //= ==================================================
  templateString,

  //= ==================================================
  // Inherited methods
  //= ==================================================
  postCreate() {
    this.inherited('postCreate', arguments);
    this._validateDialog = new RDFormsValidateDialog({
      // Placeholder value, just to separate from initial check for empty string
      maxWidth: 800,
    }, this._validateDialogNode);
    this._validateDialog.closeLabel = this.NLSBundles.esreReport.closeValidationDialog;
    this._validateDialog.validator.includeLevel = 'recommended';
    this.allInited = Promise.all([tp]);
    const tp = registry.onInit('itemstore').then((itemstore) => {
      const t2t = config.registry.type2template;
      this.type2template = {};
      Object.keys(t2t).forEach((cls) => {
        this.type2template[ns.expand(cls)] = itemstore.getItem(t2t[cls]);
      });
      this.mandatoryTypes = config.registry.mandatoryValidationTypes.map(mt => ns.expand(mt));
    });
  },
  show() {
    this._graph = registry.get('clipboardGraph');
    if (this._graph == null || this._graph.isEmpty()) {
      const bundle = this.NLSBundles.esreSource;
      registry.get('dialogs').acknowledge(bundle.noRDF, bundle.noRDFProceed).then(() => {
        registry.get('siteManager').render('toolkit__rdf__source');
      });
      return;
    }
    this.allInited.then(this._templateBasedValidation.bind(this));
  },
  //= ==================================================
  // Private methods
  //= ==================================================
  localeChange() {
    if (this._validateDialog) {
      this._validateDialog.closeLabel = esreReport.closeValidationDialog;
    }
  },

  _templateBasedValidation() {
    this._rdformsNode.innerHTML = '';
    const report = validate.graphReport(this._graph, this.type2template, this.mandatoryTypes);
    const type2resourceReports = regroup(report.resources, 'type');
    Object.keys(type2resourceReports).forEach((key) => {
      ClassReport({
        rdftype: key,
        reports: type2resourceReports[key],
        validateDialog: this._validateDialog,
        graph: this._graph,
        template: this.type2template[key],
      }, htmlUtil.create('div', {class: 'instance'}, this._rdformsNode));
    });
  },
});