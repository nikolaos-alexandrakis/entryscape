import BaseList from 'commons/list/common/BaseList';
import escoList from 'commons/nls/escoList.nls';
import registry from 'commons/registry';
import MultiList from 'commons/store/MultiList';
import PublicView from 'commons/view/PublicView';
import declare from 'dojo/_base/declare';
import esreStatus from 'registry/nls/esreStatus.nls';
import { types } from 'store';
import PipelineResultsViewDialog from '../harvest/PipelineResultsViewDialog';
import './esreStatus.css';
import HarvestingRow from './HarvestingRow';

export default declare([BaseList, PublicView], {
  nlsBundles: [{ escoList }, { esreStatus }],
  includeCreateButton: false,
  includeEditButton: false,
  includeInfoButton: false,
  includeHead: true,
  searchVisibleFromStart: true,
  includeSortOptions: false,
  tags: [],
  tagsModifier: null,
  succeeded: null,
  limit: 20,
  rowClass: HarvestingRow,
  rowClickDialog: 'pipelineResultRowAction',

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
    const b = this.NLSLocalized.esreStatus;
    this.getView().setTableHead(`<div class="psirow">
        <div class="vmiddle entryName" title="${b.organizationTitle}">${b.organizationLabel}</div>
        <div>
        <div class="vmiddle psiname" title="${b.psiPageTitle}">${b.psiPageLabel}</div>
        <div class="vmiddle dcatAP" title="${b.dcatAPTitle}">${b.dcatAPLabel}</div>
        <div class="vmiddle harvestDate" title="${b.checkedTitle}">${b.checkedLabel}</div>
        </div>
      </div>`);
  },

  showStopSign() {
    return false;
  },

  search(params) {
    const es = registry.get('entrystore');
    let lists = [
      es.newSolrQuery().literalProperty('storepr:check', 'true').literalProperty('storepr:merge', 'true'),
      es.newSolrQuery().literalProperty('storepr:merge', 'true').literalProperty('storepr:check', 'true', 'not'),
      es.newSolrQuery().literalProperty('storepr:check', 'true').literalProperty('storepr:merge', 'true', 'not'),
      es.newSolrQuery().literalProperty('storepr:check', 'true', 'not').literalProperty('storepr:merge', 'true', 'not'),
    ];

    if (params && params.term) {
      lists.map(l => l.title(params.term));
    }
    if (params && params.sortOrder === 'title') {
      lists.map(l => l.sort('title.nolang+asc'));
    } else {
      lists.map(l => l.sort('modified+desc'));
    }
    lists = lists.map(l => l.graphType(types.GT_PIPELINERESULT)
      .tagLiteral(['latest', 'psi'], 'and').limit(this.limit).list());

    this.entryList = new MultiList({
      limit: this.limit,
      lists,
    });
    this.listView.showEntryList(this.entryList);
  },
});
