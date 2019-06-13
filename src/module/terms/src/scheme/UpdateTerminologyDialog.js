import Button from 'commons/components/common/button/Button';
import RowComponent from 'commons/components/common/grid/Row';
import EditDialog from 'commons/list/common/EditDialog';
import escoRdformsNLS from 'commons/nls/escoRdforms.nls';
import ProgressDialog from 'commons/progresstask/ProgressDialog';
import { updateProgressDialog } from 'commons/progresstask/util';
import registry from 'commons/registry';
import skosUtil from 'commons/tree/skos/util';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import { cloneDeep } from 'lodash-es';
import m from 'mithril';
import { namespaces } from 'rdfjson';
import esteTerminologyNLS from 'terms/nls/esteTerminology.nls';

const initialTasks = {
  conceptScheme: {
    id: 'conceptScheme',
    name: '',
    nlsTaskName: 'namespaceTaskUploadConceptScheme', // nlsString
    width: '50%', // max width / nr of tasks,
    order: 1,
    status: '', // started, progress, done
    message: '',
  },
  concepts: {
    id: 'concepts',
    name: '',
    nlsTaskName: 'namespaceTaskUploadConcepts', // nlsString
    width: '50%', // max width / nr of tasks,
    order: 2,
    status: '', // started, progress, done
    message: '',
  },
};

const showFooterResult = (modalFooter, onclick, message = null) => {
  m.render(modalFooter, m(RowComponent, {
    classNames: ['spaSideDialogFooter'],
    columns: [{
      size: 12,
      value: [
        m(Button, {
          element: 'button',
          // type: message ? 'default' : 'primary',
          classNames: ['btn-lg', 'btn-block', 'btn-raised'],
          text: message ? 'cancel' : 'done',
          onclick,
        }),
      ],
    }],
  }));
};

export default declare(EditDialog, {
  async doneAction(graph) {
    const conceptSchemeEntry = this.row.entry;
    const conceptSchemeRURI = conceptSchemeEntry.getResourceURI();
    const oldNamespace = conceptSchemeEntry.getMetadata().find(conceptSchemeRURI, 'void:uriSpace');

    // normalize namespace if there's one
    const namespaceStmt = graph.find(conceptSchemeRURI, 'void:uriSpace')[0];
    const newNamespace = namespaceStmt.getValue();
    if (!(newNamespace.endsWith('/') || newNamespace.endsWith('#'))) {
      namespaceStmt.setValue(`${newNamespace}/`);
    }

    try {
      // update the object uri for the concept entries skos:inScheme triple
      if (newNamespace !== oldNamespace) {
        const esteTerminology = i18n.getLocalization(esteTerminologyNLS);
        return registry.get('dialogs')
          .confirm(
            esteTerminology.namespaceUpdateConfirmation,
            esteTerminology.namespaceUpdateConfirmationAffirmative,
            esteTerminology.namespaceUpdateConfirmationNegative,
            async (confirm) => {
              /** START Update UI (progress dialog */

              const progressDialog = new ProgressDialog();
              progressDialog.show();

              const tasks = cloneDeep(initialTasks);
              tasks.conceptScheme.name = esteTerminology[tasks.conceptScheme.nlsTaskName];
              tasks.concepts.name = esteTerminology[tasks.concepts.nlsTaskName];
              const showProgressDialogFooter = () => {
                updateProgressDialog(progressDialog, tasks, {
                  showFooterResult:
                    showFooterResult
                      .bind(null, progressDialog.getModalFooter(), progressDialog.hide.bind(progressDialog)),
                  updateFooter: true,
                });
              };

              if (!confirm) {
                delete tasks.concepts;
                tasks.conceptScheme.width = '100%';
              }

              tasks.conceptScheme.status = 'progress';
              updateProgressDialog(progressDialog, tasks);

              const async = registry.get('asynchandler');
              async.addIgnore('commitMetadata', async.codes.GENERIC_PROBLEM, true);

              /** END Update UI (progress dialog */

                // Map<'skos:inScheme', [Entry1, Entry2, ...]>
              const conceptEntriesMap =
                  await skosUtil.getSemanticRelations(conceptSchemeRURI, ['skos:inScheme']);
              const conceptEntries = conceptEntriesMap.get('skos:inScheme');


              // update metatadata, this part updates the concept scheme metadata only. E.g dcterms:title
              conceptSchemeEntry.setMetadata(graph);
              await conceptSchemeEntry.commitMetadata();
              this.list.rowMetadataUpdated(this.row);


              const updatesConceptPromises =
                await skosUtil.updateConceptSchemeRURI(conceptSchemeEntry, newNamespace, conceptEntries);

              const totalPromises = updatesConceptPromises.length;

              if (totalPromises) {
                let fulfilledCount = 0;
                for await (const conceptMdCommitted of updatesConceptPromises) { // eslint-disable-line
                  tasks.conceptScheme.message =
                    i18n.localize(esteTerminology, 'namespaceUpdateConceptSchemeLinks', [++fulfilledCount, totalPromises]);
                  updateProgressDialog(progressDialog, tasks);
                }
                await updatesConceptPromises; // @todo needed??
                updateProgressDialog(progressDialog, tasks);

                tasks.conceptScheme.status = 'done';

                if (confirm) {
                  tasks.concepts.status = 'progress';
                  fulfilledCount = 0;
                  for (const conceptEntry of conceptEntries) {
                    const { localname } = namespaces.nsify(conceptEntry.getResourceURI());
                    await skosUtil.updateConceptResourceURI(conceptEntry, newNamespace + localname);

                    tasks.concepts.message =
                      i18n.localize(esteTerminology, 'namespaceUpdateConceptRURI', [++fulfilledCount, totalPromises]);
                    updateProgressDialog(progressDialog, tasks);
                  }

                  tasks.concepts.status = 'done';
                  showProgressDialogFooter();
                }
              } else {
                tasks.conceptScheme.status = 'done';
                tasks.conceptScheme.message = esteTerminology.namespaceUpdateNoConcepts;
                showProgressDialogFooter();
              }
            })
          // The confirm dialog functionality rejects if the 'no' was chosen which prevents closing the Dialog.
          // So, the promise it's caught  here instead so it's resolved in the dialog
          .catch(() => true);
      }
    } catch (err) {
      // something went wrong with committing metadata
      if (err.response.status === 412) {
        const escoRdforms = i18n.getLocalization(escoRdformsNLS);
        return registry.get('dialogs')
          .confirm(
            escoRdforms.metadataConflictMessage,
            escoRdforms.metadataConflictLoadChanges,
            escoRdforms.metadataConflictCancel)
          .then(() => {
            self.refreshEntry(conceptSchemeEntry);
            throw escoRdforms.metadataConflictRefreshMessage;
          }, () => {
            throw escoRdforms.metadataConflictRemainMessage;
          });
      }
      throw err;
    }


    return Promise.resolve(); // to provide consistent returns
  },
});
