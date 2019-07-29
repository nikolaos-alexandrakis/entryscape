import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import ProgressDialog from 'commons/progress/ProgressDialog';
import typeIndex from 'commons/create/typeIndex';
import { i18n } from 'esi18n';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import m from 'mithril';

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

  const openAddFile = () => {
    const addFileDialog = new AddFileDialog({ destroyOnHide: true }, DOMUtil.create('div'));
    const escaFilesList = i18n.getLocalization(escaFilesListNLS);
    addFileDialog.open({
      list: {
        entry: distribution,
        nlsSpecificBundle: escaFilesList,
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
      },
      onDone: () => m.redraw(),
    });
  };

  const openManageFiles = (fileEntryURIs) => {
    const manageFilesDialog = new ManageFilesDialog({ destroyOnHide: true }, DOMUtil.create('div'));
    manageFilesDialog.open({
      entry: distribution,
      row: { entry: distribution },
      fileEntryApiURIs: fileEntryURIs,
      datasetEntry: dataset,
      onDone: () => m.redraw(),
    });
  };

  const openStatistics = async () => {
    const showStatisticsDialog = new StatisticsDialog();
    let entries;
    if (isAPIDistribution(distribution)) {
      entries = [distribution];
    } else {
      entries = await getDistributionFileEntries(distribution);
    }
    showStatisticsDialog.open({
      entries,
    });
  };

  const actions = {
    remove,
    editSuggestion,
    editChecklist,
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
