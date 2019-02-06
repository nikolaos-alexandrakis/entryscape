import BaseList from 'commons/list/common/BaseList';
import escoList from 'commons/nls/escoList.nls';
import registry from 'commons/registry';
import PublicView from 'commons/view/PublicView';
import declare from 'dojo/_base/declare';
import esreStatus from 'registry/nls/esreStatus.nls';
import { types } from 'store';
import PipelineResultsViewDialog from '../harvest/PipelineResultsViewDialog';
import HarvestingRow from './HarvestingRow';

export default declare([BaseList, PublicView], {
  nlsBundles: [{ escoList }, { esreStatus }],
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
    this.getView().setTableHead(`<div class='psirow'>
      <div class='vmiddle entryName'>${b.otherOrgLabel}</div> 
      <div class='flex-wrapper'>
      <div class='vmiddle dcatAP'>${b.dcatAPLabel}</div>
      <div class='vmiddle harvestDate'>${b.checkedLabel}</div> 
      </div>
      </div>`);
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
