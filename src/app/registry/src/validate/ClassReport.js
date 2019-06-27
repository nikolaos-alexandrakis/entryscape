import m from 'mithril';
import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import jquery from 'jquery';
import esreReportNLS from 'registry/nls/esreReport.nls';
import ClassReportTemplate from './ClassReportTemplate.html';
import CollapsableCard from 'commons/components/bootstrap/Collapse/Card';
import template from './InstanceReportTemplate.html';

const InstanceReportWidget = declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  report: null,
  template: null,
  graph: null,
  nlsBundles: [{ esreReportNLS }],
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
  nlsBundles: [{ esreReportNLS }],
  templateString: ClassReportTemplate,
  postCreate() {
    this.inherited('postCreate', arguments);
    // jquery(this.card).collapse('hide');
    const headerTitle = i18n.renderNLSTemplate(this.NLSLocalized0.instancesHeader, {
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

    const problems = [];
    if (nrErr > 0) {
      problems.push(
        <span title={i18n.renderNLSTemplate(this.NLSLocalized0.errorTitle, nrErr)}>
          {nrErr}<i class="fas fa-exclamation-triangle"></i>
        </span>,
      );
    }
    if (nrWarn > 0) {
      problems.push(
        <span title={i18n.renderNLSTemplate(this.NLSLocalized0.warningTitle, nrWarn)}>
          {nrWarn}<i class="fas fa-exclamation-circle"></i>
        </span>,
      );
    }

    if (nrDep > 0) {
      problems.push(
        <span title={i18n.renderNLSTemplate(this.NLSLocalized0.deprecatedTitle, nrDep)}>
          {nrDep}<i class="fas fa-question-circle"></i>
        </span>,
      );
    }


    // htmlUtil.create("h3",
    // {"class": "instanceType", innerHTML: messages.instancesHeader + key}, this._rdformsNode);
    const reports = this.reports.map(resourceReport => m('div', {config: InstanceReportWidget({
      report: resourceReport,
      validateDialog: this.validateDialog,
      graph: this.graph,
      template: this.template,
    }, htmlUtil.create('div')).domNode}));

    const headerNode = (<div class="">
      {headerTitle}
    </div>);

    m.render(this.domNode, m(CollapsableCard, {
      body: reports,
      title: headerNode,
      date: <div class="float-right problems">{problems}</div>,
      cardId: parseInt(Math.random() * 50, 10),
    }));
  },
});

const InstanceReport = () => {
  console.log('hello');
  return {
    view() {
      const esreReport = i18n.getLocalization(esreReportNLS);

      return <tbody>
        <tr data-dojo-attach-point="instanceRow">
          <td class="instanceHeader" colspan="3">
            <span data-dojo-attach-point="instanceHeader"></span>
            <button type="button" class="btn btn-sm btn-raised btn-success float-right"
              data-dojo-attach-event="onclick:_openView">
              <i class="fas fa-eye fa-lg"></i>
              <span>{esreReport.viewValidation}</span>
            </button>
          </td>
        </tr>
      </tbody>;
    },
  };
};

export const ClassReport = (vnode) => {
  const { reports, graph, rdfType } = vnode.attrs;
  const esreReport = i18n.getLocalization(esreReportNLS);

  const headerTitle = i18n.renderNLSTemplate(esreReport.instancesHeader, {
    nr: reports.length,
    class: registry.get('namespaces').shorten(rdfType),
  });

  let nrErr = 0;
  let nrWarn = 0;
  let nrDep = 0;
  reports.forEach((rep) => {
    nrErr += rep.errors.length;
    nrWarn += rep.warnings.length;
    nrDep += rep.deprecated.length;
  });

  const problems = [];
  if (nrErr > 0) {
    problems.push(
      <span title={i18n.renderNLSTemplate(esreReport.errorTitle, nrErr)}>
        {nrErr}<i class="fas fa-exclamation-triangle"></i>
      </span>,
    );
  }
  if (nrWarn > 0) {
    problems.push(
      <span title={i18n.renderNLSTemplate(esreReport.warningTitle, nrWarn)}>
        {nrWarn}<i class="fas fa-exclamation-circle"></i>
      </span>,
    );
  }

  if (nrDep > 0) {
    problems.push(
      <span title={i18n.renderNLSTemplate(esreReport.deprecatedTitle, nrDep)}>
        {nrDep}<i class="fas fa-question-circle"></i>
      </span>,
    );
  }


  return {
    view() {
      const esreReport = i18n.getLocalization(esreReportNLS);
      // validateDialog={g.validateDialog}
      const instanceReports = reports.map(resourceReport =>
        <InstanceReport
          report={resourceReport}
          graph={graph}
        />
      );

      return <div class="classReport" data-dojo-attach-point="_rdformsNode">
        <CollapsableCard
          body={instanceReports}
          title={headerTitle}
          date={<div class="float-right problems">{problems}</div>}
          cardId={parseInt(Math.random() * 50, 10)}
        />

        <div class="card">

          <div id={`_collapse`}
            class="card-collapse collapse table"
            role="tabcard"
            data-dojo-attach-point="card"
          >

            <table class="table" data-dojo-attach-point="reportTable">
              <thead>
                <tr>
                  <th>{esreReport.severity}</th>
                  <th>{esreReport.path}</th>
                  <th>{esreReport.problem}</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>


      </div>;
    },
  };
};
