import GCEList from 'commons/gce/List';
import escoList from 'commons/nls/escoList.nls';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import esreHarvest from 'registry/nls/esreHarvest.nls';
import { types } from 'store';
import CreatePipelineDialog from './CreatePipelineDialog';
import EditPipelineDialog from './EditPipelineDialog';
import PipelineResultsViewDialog from './PipelineResultsViewDialog';
import PipelineRow from './PipelineRow';

export default declare([GCEList], {
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: false,
  includeRemoveButton: true,
  nlsGCEPublicTitle: 'publicHarvestTitle',
  nlsGCEProtectedTitle: 'privateHarvestTitle',
  nlsBundles: [{ escoList }, { esreHarvest }],
  entryType: registry.get('namespaces').expand('store:Pipeline'),
  class: 'pipeline',
  rowClass: PipelineRow,
  rowClickDialog: 'status',
  rowActionNames: ['status', 'configure', 'remove'],
  includeSortOptions: true,
  useNoLangSort: true,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.registerDialog('create', CreatePipelineDialog);
    this.registerDialog('status', PipelineResultsViewDialog);
    this.registerDialog('configure', EditPipelineDialog);
    this.registerRowAction({
      name: 'status',
      button: 'default',
      iconType: 'fa',
      icon: 'info-circle',
      nlsKey: 'harvestingJobs',
      nlsKeyTitle: 'harvestingJobsTitle',
    });
    this.registerRowAction({
      name: 'configure',
      button: 'default',
      iconType: 'fa',
      icon: 'cogs',
      nlsKey: 'configure',
      nlsKeyTitle: 'configureTitle',
    });
  },

  show() {
    const esu = registry.get('entrystoreutil');
    esu.preloadEntries(registry.get('namespaces').expand('store:Pipeline'), registry.get('context'));
    this.render();
  },
  getEmptyListWarning() {
    return this.NLSLocalized1.emptyListWarning;
  },
  getNlsForCButton() {
    return {
      nlsKey: this.NLSLocalized1.cOHeader,
      nlsKeyTitle: this.NLSLocalized1.cOHeader,
    };
  },
  /**
   *
   * @param params
   * @param row
   */
  installActionOrNot() {
  },
  getSearchObject() {
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().graphType(types.GT_PIPELINE).tagLiteral('opendata');
  },
});
