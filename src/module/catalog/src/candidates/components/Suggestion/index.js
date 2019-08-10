import config from 'config';
import registry from 'commons/registry';
import dateUtil from 'commons/util/dateUtil';
import { createSetState } from 'commons/util/util';
import {
  getTitle,
  getModifiedDate,
} from 'commons/util/metadata';
import DOMUtil from 'commons/util/htmlUtil';
import Collapsable from 'commons/components/bootstrap/Collapse/Generic';
import ProgressBar from '../ProgressBar';
import SuggestionDataset from '../SuggestionDataset';
import SuggestionActions from '../SuggestionActions';
import bindActions from './actions';
import './index.scss';

export default (vnode) => {
  const { entry, updateParent = () => {} } = vnode.attrs;
  const actions = bindActions(entry, DOMUtil.preventBubbleWrapper);

  const state = {
    datasets: [],
    requests: [],
  };

  const setState = createSetState(state);

  const editChecklist = e => actions.editChecklist(e, () => m.redraw());
  const removeDatasetReference = (e, uri) => actions.removeDatasetReference(e, uri, () => {
    // We need to remove the dataset reference from the state as the solr index will not
    // be updated in time for the refresh
    console.log('hey');
    console.log(state.datasets);
  });
  const cardId = `suggestion${entry.getId()}`;

  const loadDatasets = () => {
    const datasetResourceURIs = entry.getMetadata()
      .find(entry.getResourceURI(), 'dcterms:references')
      .map(statement => statement.getValue());

    console.log(datasetResourceURIs);

    if (datasetResourceURIs.length > 0) {
      registry.get('entrystore')
        .newSolrQuery()
        .rdfType('dcat:Dataset')
        .resource(datasetResourceURIs)
        .getEntries()
        .then((datasets) => {
          console.log(datasets);
          setState({ datasets });
        });
    }
  };

  const getChecklistProgress = () => {
    if (config.catalog && config.catalog.checklist) {
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

  return {
    view() {
      const title = getTitle(entry);
      const modificationDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));
      const checklistProgress = getChecklistProgress();

      const checklistPercent = checklistProgress.percent;
      const checklistMandatoryComplete = checklistProgress.mandatoryChecklistComplete;

      return (
        <div class="suggestion d-flex">
          <ProgressBar
            progressPercent={checklistPercent}
            incomplete={!checklistMandatoryComplete}
            onclick={editChecklist}
          />
          <Collapsable
            title={title}
            subTitle={[modificationDate.short, <SuggestionActions entry={entry} updateParent={updateParent} />]}
            className="flex-fill"
            cardId={cardId}
            onclick={loadDatasets}
          >
            {state.datasets.map(entry => (
              <SuggestionDataset
                entry={entry}
                onRemove={removeDatasetReference}
              />
            ))}
          </Collapsable>

        </div>
      );
    },
  };
};
