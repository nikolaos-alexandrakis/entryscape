import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import jquery from 'jquery';
import esreReport from 'registry/nls/esreReport.nls';
import ClassReportTemplate from './ClassReportTemplate.html';
import template from './InstanceReportTemplate.html';

const InstanceReport = declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  report: null,
  template: null,
  graph: null,
  nlsBundles: [{ esreReport }],
  templateString: template,

  postCreate() {
    this.inherited('postCreate', arguments);
    const messages = this.NLSLocalized0;
    const errorSeverityHTML = '<i class="fas fa-exclamation-triangle"></i>';
    const warningSeverityHTML = '<i class="fas fa-exclamation-circle"></i>';
    const deprecatedSeverityHTML = '<i class="fas fa-question-circle"></i>';
    this.report.errors.forEach((err) => {
      const row = htmlUtil.create('tr', null, this.domNode);
      htmlUtil.create('td', {
        title: messages.error,
        innerHTML: errorSeverityHTML,
      }, row);
      htmlUtil.create('td', { innerHTML: err.path }, row);
      htmlUtil.create('td', { innerHTML: messages[`report_${err.code}`] }, row);
    }, this);
    this.report.warnings.forEach((warn) => {
      const row = htmlUtil.create('tr', null, this.domNode);
      htmlUtil.create('td', {
        title: messages.warning,
        innerHTML: warningSeverityHTML,
      }, row);
      htmlUtil.create('td', { innerHTML: warn.path }, row);
      htmlUtil.create('td', { innerHTML: messages[`report_${warn.code}`] }, row);
    }, this);

    this.report.deprecated.forEach((dep) => {
      const row = htmlUtil.create('tr', null, this.domNode);
      htmlUtil.create('td', {
        title: messages.deprecated,
        innerHTML: deprecatedSeverityHTML,
      }, row);
      htmlUtil.create('td', { innerHTML: dep }, row);
      htmlUtil.create('td', { innerHTML: messages.deprecated }, row);
    }, this);

    const titleStr = i18n.renderNLSTemplate(messages.reportHead, {
      URI: this.report.uri,
      errors: this.report.errors.length,
      warnings: this.report.warnings.length,
    });
    this.instanceHeader.innerHTML = titleStr;
    if (this.report.errors.length > 0) {
      this.domNode.classList.add('errors');
    } else if (this.report.warnings.length > 0) {
      this.domNode.classList.add('warnings');
    }
  },
  _openView() {
    // var binding = Engine.match(this.graph, this.report.uri, this.template);
    // Engine.report(binding);
    this.validateDialog.title = this.report.uri;
    this.validateDialog.localeChange();
    this.validateDialog.show(this.report.uri, this.graph, this.template);
  },
});

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  nlsBundles: [{ esreReport }],
  templateString: ClassReportTemplate,
  postCreate() {
    this.inherited('postCreate', arguments);
    jquery(this.panel).collapse('hide');
    this.headingNode.innerHTML = i18n.renderNLSTemplate(this.NLSLocalized0.instancesHeader, {
      nr: this.reports.length,
      class: registry.get('namespaces').shorten(this.rdftype),
    });
    let nrErr = 0;
    let nrWarn = 0;
    let nrDep = 0;
    this.reports.forEach((rep) => {
      nrErr += rep.errors.length;
      nrWarn += rep.warnings.length;
      nrDep += rep.deprecated.length;
    });
    if (nrErr > 0) {
      htmlUtil.create('span', {
        title: i18n.renderNLSTemplate(this.NLSLocalized0.errorTitle, nrErr),
        innerHTML: `${nrErr}<i class="fas fa-exclamation-triangle"></i>`,
      }, this.problems);
    }
    if (nrWarn > 0) {
      htmlUtil.create('span', {
        title: i18n.renderNLSTemplate(this.NLSLocalized0.warningTitle, nrWarn),
        innerHTML: `${nrWarn}<i class="fas fa-exclamation-circle"></i>`,
      }, this.problems);
    }

    if (nrDep > 0) {
      htmlUtil.create('span', {
        title: i18n.renderNLSTemplate(this.NLSLocalized0.deprecatedTitle, nrDep),
        innerHTML: `${nrDep}<i class="fas fa-question-circle"></i>`,
      }, this.problems);
    }

    // htmlUtil.create("h3",
    // {"class": "instanceType", innerHTML: messages.instancesHeader + key}, this._rdformsNode);
    this.reports.forEach((resourceReport) => {
      InstanceReport({
        report: resourceReport,
        validateDialog: this.validateDialog,
        graph: this.graph,
        template: this.template,
      }, htmlUtil.create('tbody', {}, this.reportTable));
    }, this);
  },
});
