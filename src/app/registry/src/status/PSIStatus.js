import registry from 'commons/registry';
import {types} from 'store';
import HarvestingRow from './HarvestingRow';
import BaseList from 'commons/list/common/BaseList';
import PublicView from 'commons/view/PublicView';
import PipelineResultsViewDialog from '../harvest/PipelineResultsViewDialog';
import MultiList from 'commons/store/MultiList';
import declare from 'dojo/_base/declare';
import escoList from 'commons/nls/escoList.nls';
import esreStatus from 'registry/nls/esreStatus.nls';
import './esreStatus.css';

export default declare([BaseList, PublicView], {
  nlsBundles: [{escoList}, {esreStatus}],
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
    const b = this.NLSBundles.esreStatus;
    this.getView().setTableHead(`<tr class="psirow">
        <th class="vmiddle entryName" title="${b.organizationTitle}">${b.organizationLabel}</th>
        <th class="vmiddle psiname" title="${b.psiPageTitle}">${b.psiPageLabel}</th>
        <th class="vmiddle dcatAP" title="${b.dcatAPTitle}">${b.dcatAPLabel}</th>
        <th class="vmiddle harvestDate" title="${b.checkedTitle}">${b.checkedLabel}</th>
      </tr>`);
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
