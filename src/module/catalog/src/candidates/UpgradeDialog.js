import registry from 'commons/registry';
import { utils } from 'rdforms';
import config from 'config';
import { NLSMixin } from 'esi18n';
import escaUpgrade from 'catalog/nls/escaUpgrade.nls';
import declare from 'dojo/_base/declare';
import { withinDatasetLimit } from 'catalog/utils/limit';

export default declare([NLSMixin], {
  nlsBundles: [{ escaUpgrade }],
  constructor() {
    this.initNLS();
  },
  open(params) {
    this.row = params.row;
    this.candidateEntry = params.row.entry;
    this.getMandatoryChecklistSteps();
    this.upgrade();
  },

  getMandatoryNonCheckedSteps() {
    const entryInfoGraph = this.candidateEntry.getEntryInfo().getGraph();
    const completedChecklistSteps = [];
    const checklistSteps = entryInfoGraph
      .find(this.candidateEntry.getResourceURI(), 'http://entrystore.org/terms/progress');
    checklistSteps.forEach((checklistStep) => {
      completedChecklistSteps.push(checklistStep.getObject().value);
    });
    const incomplete = [];
    this.mandatoryChecklistSteps.forEach((mandatoryChecklistStep) => {
      if (completedChecklistSteps.indexOf(mandatoryChecklistStep.name) === -1) {
        incomplete.push(mandatoryChecklistStep);
      }
    }, this);
    return incomplete;
  },
  upgrade() {
    const dialogs = registry.get('dialogs');
    const bundle = this.NLSLocalized.escaUpgrade;
    if (!bundle) {
      return;
    }
    const incomplete = this.getMandatoryNonCheckedSteps();
    if (incomplete.length === 0) {
      const doUpgrade = this.doUpgrade.bind(this);
      const list = this.candidateEntry.getEntryStore().newSolrQuery()
        .rdfType('dcat:Dataset').limit('1')
        .context(this.candidateEntry.getContext())
        .list();
      list.getEntries().then(() => {
        if (!withinDatasetLimit(list.getSize())) {
          registry.get('dialogs').restriction(config.catalog.datasetLimitCandidateUpgradeDialog);
          throw Error('Stop');
        } else {
          dialogs.confirm(bundle.upgradeToDataset, null, null).then(doUpgrade);
        }
      });
    } else {
      const incompleteList = incomplete.map(step => `<li>${step.label}</li>`);
      dialogs.acknowledge(`${bundle.mandatoryFail}<ul>${incompleteList.join('')}</ul>`);
    }
  },
  doUpgrade() {
    const row = this.row;
    const ce = this.candidateEntry;
    const md = ce.getMetadata();
    const ceURI = ce.getResourceURI();
    const addCatalogRelation = (catalog) => {
      catalog.getMetadata().add(catalog.getResourceURI(), 'dcat:dataset', ce.getResourceURI());
      catalog.commitMetadata().then(() => {
        row.list.getView().removeRow(row);
        row.destroy();
      });
    };
    md.findAndRemove(ceURI, 'rdf:type', 'esterms:CandidateDataset');
    md.add(ceURI, 'rdf:type', 'dcat:Dataset');
    return ce.commitMetadata().then(() => {
      registry.get('entrystoreutil').getEntryByType('dcat:Catalog', ce.getContext())
        .then(addCatalogRelation);
    });
  },
  getMandatoryChecklistSteps() {
    this.mandatoryChecklistSteps = [];
    if (config.catalog && config.catalog.checklist) {
      const checklistSteps = config.catalog.checklist;
      checklistSteps.forEach((checklistStep) => {
        if (checklistStep.mandatory) {
          this.mandatoryChecklistSteps.push({
            name: checklistStep.name,
            label: utils.getLocalizedValue(checklistStep.label).value,
          });
        }
      });
    }
  },
});
