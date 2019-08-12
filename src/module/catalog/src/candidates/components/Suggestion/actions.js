import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import ProgressDialog from 'commons/progress/ProgressDialog';
import CommentDialog from 'commons/comments/CommentDialog';
import typeIndex from 'commons/create/typeIndex';
import { i18n } from 'esi18n';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import CreateDatasetDialog from 'catalog/datasets/DatasetCreateDialog';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';

export default (suggestion, wrapperFunction) => {
  // STUBBED DIALOGS
  const EditSuggestionDialog = declare([RDFormsEditDialog], {
    maxWidth: 800,
    explicitNLS: true,
    open(params) {
      const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
      this.inherited(arguments);

      this.onDone = params.onDone;
      const entry = params.row.entry;
      this.suggestionEntry = entry;

      this.set('title', escaPreparations.editSuggestionHeader);
      this.set('doneLabel', escaPreparations.editSuggestionButton);
      this.doneLabel = escaPreparations.editDistributionButton;
      this.title = escaPreparations.editSuggestionHeader;
      this.updateTitleAndButton();

      registry.set('context', entry.getContext());

      entry.setRefreshNeeded();
      entry.refresh().then(() => {
        this.showEntry(entry, this.getTemplate(entry), 'recommended');
      });
    },
    getTemplate(entry) {
      const conf = typeIndex.getConf(entry);
      if (conf) {
        return registry.get('itemstore').getItem(conf.template);
      }

      return registry.get('itemstore').createTemplateFromChildren([
        'dcterms:title',
        'dcterms:description',
      ]);
    },
    doneAction(graph) {
      this.suggestionEntry.setMetadata(graph);
      return this.suggestionEntry.commitMetadata().then(this.onDone);
    },
  });

  // END STUBBED DIALOGS

  /*
   This deletes selected distribution and also deletes
   its relation to dataset
   */
  const removeSuggestion = (onSuccess = () => {}, onError = () => {}) => {
    suggestion
      .del()
      .then(onSuccess)
      .catch(onError);
  };

  // ACTIONS
  const progressDialog = new ProgressDialog({ suggestion });
  const editChecklist = (onDone) => {
    progressDialog.open({
      row: {
        entry: suggestion,
      },
      entry: suggestion,
      onDone,
    });
  };

  const commentsDialog = new CommentDialog({ suggestion });
  const editComments = (onDone) => {
    commentsDialog.open({
      row: {
        entry: suggestion,
      },
      entry: suggestion,
      onDone,
    });
  };

  const editSuggestion = (onDone) => {
    const editDialog = new EditSuggestionDialog({
      destroyOnHide: true,
      row: {
        entry: suggestion,
      },
    }, DOMUtil.create('div'));
    // @scazan Some glue here to communicate with RDForms without a "row"
    editDialog.open({ row: { entry: suggestion }, onDone });
  };

  const remove = (onSuccess = () => {}) => {
    const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
    const dialogs = registry.get('dialogs');
    dialogs.confirm(escaPreparations.removeSuggestionQuestion,
      null, null, (confirm) => {
        if (!confirm) {
          return;
        }

        removeSuggestion(onSuccess);
      });
  };

  const createDatasetDialog = new CreateDatasetDialog();
  const createDataset = (onDone = () => {}) => {
    createDatasetDialog.open({
      onDone: (datasetEntry) => {
        suggestion
          .getMetadata()
          .add(suggestion.getResourceURI(), 'dcterms:references', datasetEntry.getResourceURI());

        suggestion.commitMetadata();

        onDone();
      },
    });
  };

  const removeDatasetReference = (datasetURI, onDone) => {
    const dialogs = registry.get('dialogs');
    const escaPreparations = i18n.getLocalization(escaPreparationsNLS);

    return dialogs.confirm(escaPreparations.removeLinkedDataset, null, null, (confirm) => {
      if (confirm) {
        suggestion.getMetadata()
          .findAndRemove(suggestion.getResourceURI(), 'dcterms:references', datasetURI);

        return suggestion
          .commitMetadata()
          .then(onDone);
      }

      return Promise.resolve(null);
    });
  };

  /**
   * Change the 'store:status' on the EntryInfo of this suggestion
   *
   * @param {string} The new status in object position
   * @param {string} The string to display in the confirmation dialog
   * @param {function} A callback to call on completion
   * @returns {undefined}
   */
  const changeStatus = (newStatus, message, onDone = () => {}) => {
    const dialogs = registry.get('dialogs');

    return dialogs.confirm(message, null, null, (confirm) => {
      if (confirm) {
        const entryInfo = suggestion.getEntryInfo().getGraph();
        entryInfo.findAndRemove(suggestion.getResourceURI(), 'store:status');
        entryInfo.add(suggestion.getResourceURI(), 'store:status', newStatus);

        return suggestion
          .getEntryInfo()
          .commit()
          .then(onDone);
      }

      return Promise.resolve(null);
    });
  };

  const archiveSuggestion = (onDone) => {
    const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
    changeStatus('esterms:archived', escaPreparations.archiveSuggestion, onDone);
  };

  const unArchiveSuggestion = (onDone) => {
    const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
    changeStatus('esterms:investigating', escaPreparations.unArchiveSuggestion, onDone);
  };

  const actions = {
    remove,
    editSuggestion,
    editChecklist,
    editComments,
    createDataset,
    removeDatasetReference,
    archiveSuggestion,
    unArchiveSuggestion,
  };

  // Sometimes we may need to compose a wrapper function.
  // For instance, when we use e.preventDefault or e.stopPropagation
  if (wrapperFunction) {
    Object.entries(actions)
      .forEach((nameAction) => {
        actions[nameAction[0]] = wrapperFunction(nameAction[1]);
      });
  }

  return actions;
};
