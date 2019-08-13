import registry from 'commons/registry';
import { i18n } from 'esi18n';
import esreReportNLS from 'registry/nls/esreReport.nls';
import CollapsableCard from 'commons/components/bootstrap/Collapse/Card';

const InstanceReport = (vnode) => {
  const { validateDialog, report, graph, rdfTemplate } = vnode.attrs;

  const renderReportBadges = (report) => {
    const esreReport = i18n.getLocalization(esreReportNLS);
    const errors = report.errors.map(err =>
      <tr>
        <td title={esreReport.error}>
          <i class="fas fa-exclamation-triangle"></i>
        </td>
        <td>
          { err.path }
        </td>
        <td>
          { esreReport[`report_${err.code}`] }
        </td>
      </tr>,
    );

    // List out all the deprecateds into a table
    const warnings = report.warnings.map(warn =>
      <tr>
        <td title={esreReport.warning}>
          <i class="fas fa-exclamation-circle"></i>
        </td>
        <td>
          { warn.path }
        </td>
        <td>
          { esreReport[`report_${warn.code}`] }
        </td>
      </tr>,
    );

    // List out all the deprecateds into a table
    const deprecateds = report.deprecated.map(dep =>
      <tr>
        <td title={esreReport.deprecated}>
          <i class="fas fa-question-circle"></i>
        </td>
        <td>
          { dep }
        </td>
        <td>
          { esreReport.deprecated }
        </td>
      </tr>,
    );

    return [...errors, ...warnings, ...deprecateds];
  };

  /**
   * Open a side dialog view of this report
   *
   * @returns {undefined}
   */
  const openView = () => {
    validateDialog.title = report.uri;
    validateDialog.localeChange();
    validateDialog.show(report.uri, graph, rdfTemplate);
  };

  return {
    view(vnode) {
      const { report } = vnode.attrs;

      const esreReport = i18n.getLocalization(esreReportNLS);
      const titleStr = i18n.renderNLSTemplate(esreReport.reportHead, {
        URI: report.uri,
        errors: report.errors.length,
        warnings: report.warnings.length,
      });

      return <tbody>
        <tr>
          <td class="instanceHeader" colspan="3">
            <span>{ titleStr }</span>
            <button type="button"
              class="btn btn-sm btn-raised btn-success float-right"
              onclick={openView}
            >
              <i class="fas fa-eye fa-lg"></i>
              <span>{esreReport.viewValidation}</span>
            </button>
          </td>
        </tr>
        {(report.errors.length > 0 || report.warnings.length > 0) &&
          <tr>
            <th>{esreReport.severity}</th>
            <th>{esreReport.path}</th>
            <th>{esreReport.problem}</th>
          </tr>
        }
        { renderReportBadges(report) }
      </tbody>;
    },
  };
};

export default ClassReport = (vnode) => {
  const { reports, graph, rdfType, rdfTemplate, validateDialog } = vnode.attrs;
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
      const instanceReports = reports.map(resourceReport =>
        <InstanceReport
          report={resourceReport}
          graph={graph}
          rdfTemplate={rdfTemplate}
          validateDialog={validateDialog}
          rdfType={rdfType}
        />,
      );

      return <div class="classReport">
        <CollapsableCard
          title={headerTitle}
          date={<div class="float-right problems">{problems}</div>}
          cardId={parseInt(Math.random() * 50, 10)}
        >
          <table className="table">
            {instanceReports}
          </table>
        </CollapsableCard>

        <div id="_collapse"
          class="card-collapse collapse table"
          role="tabcard"
        >
        </div>
      </div>;
    },
  };
};
