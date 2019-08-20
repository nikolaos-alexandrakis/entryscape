import CreateDatasetDialog from 'catalog/datasets/DatasetCreateDialog';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import LinkToDataset from 'catalog/preparations/components/LinkToDataset';
import CommentDialog from 'commons/comments/CommentDialog';
import typeIndex from 'commons/create/typeIndex';

import TitleDialog from 'commons/dialog/TitleDialog';
import ProgressDialog from 'commons/progress/ProgressDialog';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';

export default (suggestionEntry, wrapperFunction) => {
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

  const LinkToDatasetDialog = declare([TitleDialog.ContentComponent], {
    nlsBundles: [{ escaPreparationsNLS }],
    nlsHeaderTitle: 'linkDatasetTitle',
    nlsFooterButtonLabel: 'linkDatasetFooterButton',
    open() {
      this.dialog.show();
      const controllerComponent = { view: () => <LinkToDataset entry={suggestionEntry}/> };
      this.show(controllerComponent);
    },
  });
  // END STUBBED DIALOGS

  /*
   This deletes selected distribution and also deletes
   its relation to dataset
   */
  const removeSuggestion = (onSuccess = () => {
  }, onError = () => {
  }) => {
    suggestionEntry
      .del()
      .then(onSuccess)
      .catch(onError);
  };

  // ACTIONS
  const progressDialog = new ProgressDialog({ suggestion: suggestionEntry });
  const editChecklist = (onDone) => {
    progressDialog.open({
      row: {
        entry: suggestionEntry,
      },
      entry: suggestionEntry,
      onDone,
    });
  };

  /**
   * @param {function} onDone A callback for the edit dialog to call when it is complete
   * @returns {undefined}
   */
  const editComments = (onDone) => {
    const name = registry.get('rdfutils').getLabel(suggestionEntry);
    const escaPreparations = i18n.getLocalization(escaPreparationsNLS);

    const commentsDialog = new CommentDialog({
      suggestion: suggestionEntry,
      title: i18n.renderNLSTemplate(escaPreparations.commentHeader, { name }),
      footerButtonLabel: escaPreparations.commentFooterButton,
    });

    commentsDialog.open({
      row: {
        entry: suggestionEntry,
        renderCommentCount: () => {
        },
      },
      entry: suggestionEntry,
      onDone,
    });
  };

  /**
   * Opens an SideDialog for editing
   *
   * @param {function} onDone A callback for the edit dialog to call when it is complete
   * @returns {undefined}
   */
  const editSuggestion = (onDone) => {
    const editDialog = new EditSuggestionDialog({
      destroyOnHide: true,
      row: {
        entry: suggestionEntry,
      },
    }, DOMUtil.create('div'));
    // @scazan Some glue here to communicate with RDForms without a "row"
    editDialog.open({ row: { entry: suggestionEntry }, onDone });
  };

  /**
   * Remove the Suggestion
   *
   * @param {function} onSuccess A callback to call on successful completion
   * @returns {P}
   */
  const remove = (onSuccess = () => {
  }) => {
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

  /**
   * @param onDone
   */
  const linkToDataset = (onDone = () => {
  }) => {
    const dialog = new LinkToDatasetDialog();
    dialog.open();
  };

  const createDatasetDialog = new CreateDatasetDialog();
  /**
   * Opens a SideDialog for creating a dataset that is attached to a Suggestion
   *
   * @param {function} onDone A callback to call on completion
   * @returns {undefined}
   */
  const createDataset = (onDone = () => {}) => {
    createDatasetDialog.open({
      onDone: (datasetEntry) => {
        suggestionEntry
          .getMetadata()
          .add(suggestionEntry.getResourceURI(), 'dcterms:references', datasetEntry.getResourceURI());

        suggestionEntry.commitMetadata().then(onDone);
      },
    });
  };

  /**
   * Removes the reference to an existing dataset from the Suggestion (does not remove the dataset)
   *
   * @param {string} datasetURI The URI of the referenced dataset that should be removed
   * @param {function} onDone A callback to call on completion
   * @returns {Promise}
   */
  const removeDatasetReference = (datasetURI, onDone) => {
    const suggestionRURI = suggestionEntry.getResourceURI();
    const md = suggestionEntry.getMetadata();
    const dialogs = registry.get('dialogs');
    const escaPreparations = i18n.getLocalization(escaPreparationsNLS);

    return dialogs.confirm(escaPreparations.removeLinkedDataset, null, null, async (confirm) => {
      if (confirm) {
        md.findAndRemove(suggestionRURI, 'dcterms:references', datasetURI);

        await suggestionEntry.commitMetadata();
        return onDone();
      }

      return Promise.resolve();
    });
  };

  /**
   * Change the 'store:status' on the EntryInfo of this suggestion
   *
   * @param {string} newStatus The new status in object position
   * @param {string} message The string to display in the confirmation dialog
   * @param {function} onDone A callback to call on completion
   * @returns {Promise}
   */
  const changeStatus = (newStatus, message, onDone = () => {
  }) => {
    const dialogs = registry.get('dialogs');

    return dialogs.confirm(message, null, null, (confirm) => {
      if (confirm) {
        const entryInfo = suggestionEntry.getEntryInfo().getGraph();
        entryInfo.findAndRemove(suggestionEntry.getURI(), 'store:status');
        entryInfo.add(suggestionEntry.getURI(), 'store:status', newStatus);

        return suggestionEntry
          .getEntryInfo()
          .commit()
          .then(() => {
            const delayMillis = 2000;
            const async = registry.get('asynchandler');
            async.openDialog(true);
            setTimeout(() => { // In order to avoid a slow solr re-index
              async.closeDialog(true);
              onDone();
            }, delayMillis);
          });
      }

      return Promise.resolve(null);
    });
  };

  /**
   * Change the status of a Suggestion to be archived
   *
   * @param {function} onDone A callback to call on completion
   * @returns {undefined}
   */
  const archiveSuggestion = (onDone) => {
    const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
    changeStatus('esterms:archived', escaPreparations.archiveSuggestion, onDone);
  };

  /**
   * Change the status of a Suggestion from archived to investigating
   *
   * @param {function} onDone A callback to call on completion
   *
   * @returns {undefined}
   */
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
    linkToDataset,
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
