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

const initialTasks = {
  conceptScheme: {
    id: 'conceptScheme',
    name: 'Update concept Scheme resource URI',
    nlsTaskName: 'uploadTask', // nlsString
    width: '50%', // max width / nr of tasks,
    order: 1,
    status: '', // started, progress, done
    message: '',
  },
  concepts: {
    id: 'concepts',
    name: 'Update concepts ',
    nlsTaskName: 'uploadTask', // nlsString
    width: '50%', // max width / nr of tasks,
    order: 2,
    status: '', // started, progress, done, skip
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
    const oldNamespace = conceptSchemeEntry.getMetadata().findFirstValue(null, 'void:uriSpace');
    const newNamespace = graph.findFirstValue(null, 'void:uriSpace');
    if (!(newNamespace.endsWith('/') || newNamespace.endsWith('#'))) {
      graph.findAndReplaceObject(resourceURI, 'void:uriSpace', `${newNamespace}/`);
    }

    try {
      // update the object uri for the concept entries skos:inScheme triple
      if (newNamespace !== oldNamespace) {
        return registry.get('dialogs').confirm('The namespace of the terminology has changed.\nWould you like also like to update the namespaces of the concepts in the concept scheme?', 'yes, update all', 'no, update only the concept scheme', async (confirm) => {
          const progressDialog = new ProgressDialog();
          progressDialog.show();

          const tasks = cloneDeep(initialTasks);
          const showProgressDialogFooter = () => {
            updateProgressDialog(progressDialog, tasks, {
              showFooterResult:
                showFooterResult.bind(null, progressDialog.getModalFooter(), progressDialog.hide.bind(progressDialog)),
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


          // Map<'skos:inScheme', [Entry1, Entry2, ...]>
          const conceptEntriesMap =
            await util.getSemanticRelations(oldResourceURI, ['skos:inScheme']);
          const conceptEntries = conceptEntriesMap.get('skos:inScheme');


          // update mdatadata
          conceptSchemeEntry.setMetadata(graph);
          await conceptSchemeEntry.commitMetadata();
          this.list.rowMetadataUpdated(this.row);

          // update ruri if needed

          let updatesConceptPromises = await skosUtil.updateConceptSchemeRURI(conceptSchemeEntry, newNamespace);

          const totalPromises = updatesConceptPromises.length;

          if (totalPromises) {
            let fulfilledCount = 0;
            for await (const conceptMdCommitted of updatesConceptPromises) {
              tasks.conceptScheme.message = `${++fulfilledCount} of ${totalPromises} concepts links updated`;
              updateProgressDialog(progressDialog, tasks);
            }
            await updatesConceptPromises; // @todo needed??
            updateProgressDialog(progressDialog, tasks);

            tasks.conceptScheme.status = 'done';


            if (confirm) {
              tasks.concepts.status = 'progress';
              fulfilledCount = 0;
              for (const conceptEntry of conceptEntries) {
                console.log('in for each');
                const { localname } = namespaces.nsify(conceptEntry.getResourceURI());

                await skosUtil.updateConceptResourceURI(conceptEntry, newNamespace + localname).then(Promise.all);
              }

              tasks.concepts.status = 'done';
              showProgressDialogFooter();
            }
          } else {
            tasks.conceptScheme.status = 'done';
            tasks.conceptScheme.message = 'No concepts in the concepts scheme to update';
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
