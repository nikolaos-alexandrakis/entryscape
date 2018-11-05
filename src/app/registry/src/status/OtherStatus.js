import registry from 'commons/registry';
import {types} from 'store';
import HarvestingRow from './HarvestingRow';
import BaseList from 'commons/list/common/BaseList';
import PublicView from 'commons/view/PublicView';
import PipelineResultsViewDialog from '../harvest/PipelineResultsViewDialog';
import escoList from 'commons/nls/escoList.nls';
import esreStatus from 'registry/nls/esreStatus.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';

export default declare([BaseList, PublicView], {
  nlsBundles: [{escoList}, {esreStatus}],
  includeCreateButton: false,
  includeEditButton: false,
  includeInfoButton: false,
  includeHead: true,
  includeSortOptions: false,
  limit: 20,
  class: 'otherOrg',
  rowClass: HarvestingRow,
  rowClickDialog: 'pipelineResultRowAction',
  useNoLangSort: true,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.registerDialog('pipelineResultRowAction', PipelineResultsViewDialog);
  },

  /**
   * @param generic
   * @param specific
   */
  updateLocaleStrings() {
    this.inherited(arguments);
    const b = this.NLSBundles.esreStatus;
    this.getView().setTableHead(`${"<tr class='psirow'>" +
      "<th class='vmiddle entryName'>"}${b.otherOrgLabel}</th>` +
      `<th class='vmiddle dcatAP'>${b.dcatAPLabel}</th>` +
      `<th class='vmiddle harvestDate'>${b.checkedLabel}</th>` +
      '</tr>');
  },

  showStopSign() {
    return false;
  },

  getSearchObject() {
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery()
      .graphType(types.GT_PIPELINERESULT)
      .limit(this.limit)
      .tagLiteral(['latest'])
      .literalProperty('dcterms:subject', 'psi', 'not');
  },
});
