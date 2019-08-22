import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import { createSetState } from 'commons/util/util';
import config from 'config';
import jquery from "jquery";
import m from 'mithril';
import ProgressBar from '../ProgressBar';
import SuggestionDataset from '../SuggestionDataset';
import SuggestionRow from '../SuggestionRow';
import bindActions from './actions';
import './index.scss';

export default (initialVnode) => {
  const {
    entry, updateParent = () => {
    },
  } = initialVnode.attrs;
  const actions = bindActions(entry, DOMUtil.preventBubbleWrapper);

  const state = {
    datasets: [],
    requests: [],
  };

  const setState = createSetState(state);

  /**
   *
   * @param e
   */
  const editChecklist = e => actions.editChecklist(e, m.redraw);


  /**
   *
   * @param e
   * @param uri
   * @return {Promise}
   */
  const removeDatasetReference = (e, uri) => actions.removeDatasetReference(e, uri, () => {
    // @scazan We need to remove the dataset reference from the state as the solr index will not
    // be updated in time for a server refresh
    const filteredDatasets = state.datasets.filter(dataset => dataset.getResourceURI() !== uri);
    updateParent();
    setState({ datasets: filteredDatasets });
  });

  /**
   *
   * @return {Promise<[]>|*}
   */
  const loadDatasets = () => {
    const datasetResourceURIs = entry.getMetadata()
      .find(entry.getResourceURI(), 'dcterms:references')
      .map(statement => statement.getValue());

    if (datasetResourceURIs.length > 0) {
      return registry.get('entrystore')
        .newSolrQuery()
        .rdfType('dcat:Dataset')
        .resource(datasetResourceURIs)
        .getEntries()
        .then((datasets) => {
          setState({ datasets });
        });
    }

    return Promise.resolve(state.datasets);
  };

  /**
   *
   * @return {{noOfMandatory: number, noOfMandatoryCompleted: number, mandatoryChecklistComplete: boolean, percent: number}|{noOfMandatory: *, noOfMandatoryCompleted: *, mandatoryChecklistComplete: *, percent: *}}
   */
  const getChecklistProgress = () => {
    if (config.get('catalog.checklist')) {
      const checklistSteps = config.catalog.checklist;
      const completedChecklistSteps = [];
      const mandatoryChecklistSteps = [];
      const infoEntryGraph = entry.getEntryInfo().getGraph();
      const tasks = infoEntryGraph.find(entry.getResourceURI(), 'http://entrystore.org/terms/progress');

      tasks.forEach((task) => {
        completedChecklistSteps.push(task.getObject().value);
      });

      const noOfTasksCompleted = completedChecklistSteps.length;
      // const noOfCheckListSteps = checklistSteps.length;

      let progress = Math.round((noOfTasksCompleted * 100) / checklistSteps.length);
      if (progress > 0) {
        progress -= 2;
      }

      checklistSteps.forEach((checklistStep) => {
        if (checklistStep.mandatory) {
          mandatoryChecklistSteps.push({
            name: checklistStep.name,
          });
        }
      });

      let mandatoryChecklistComplete = true;
      let mandatory = mandatoryChecklistSteps.length;
      mandatoryChecklistSteps.forEach((mandatoryChecklistStep) => {
        if (completedChecklistSteps.indexOf(mandatoryChecklistStep.name) === -1) {
          mandatoryChecklistComplete = false;
          mandatory -= 1;
        }
      });
      const noOfMandatoryCompleted = mandatory;
      const noOfMandatory = mandatoryChecklistSteps.length;

      return {
        percent: progress,
        noOfMandatory,
        noOfMandatoryCompleted,
        mandatoryChecklistComplete,
      };
    }

    // DEFAULTS
    return {
      percent: 0,
      noOfMandatory: 0,
      noOfMandatoryCompleted: 0,
      mandatoryChecklistComplete: false,
    };
  };

  /**
   *
   * @return {*}
   */
  const collapseDatasetList = () => loadDatasets().then(() => {
    jquery(initialVnode.dom.querySelector('.collapse')).collapse('toggle');
  });

  return {
    view() {
      const checklistProgress = getChecklistProgress();

      const checklistPercent = checklistProgress.percent;
      const checklistMandatoryComplete = checklistProgress.mandatoryChecklistComplete;

      return <div>
        <div className={'suggestionRow'}>
          <div className="d-flex">
            <ProgressBar
              className="listRowBg"
              progressPercent={checklistPercent}
              incomplete={!checklistMandatoryComplete}
              onclick={editChecklist}
            />
            <SuggestionRow entry={entry} onclick={collapseDatasetList}/>
          </div>
          <div className="collapse">
            <div className="list datasets">
              {state.datasets.map(dataset => <SuggestionDataset
                key={dataset.getId()}
                entry={dataset}
                onRemove={removeDatasetReference}/>)}
            </div>
          </div>
        </div>
      </div>;
    },
  };
};
