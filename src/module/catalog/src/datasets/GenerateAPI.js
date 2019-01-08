import Alert from 'commons/components/common/alert/Alert';
import Button from 'commons/components/common/button/Button';
import Row from 'commons/components/common/grid/Row';
import TaskProgress from 'commons/progresstask/components/TaskProgress';
import ProgressDialog from 'commons/progresstask/ProgressDialog';
import registry from 'commons/registry';
import config from 'config';
import declare from 'dojo/_base/declare';
import stamp from 'dojo/date/stamp';
import { i18n } from 'esi18n';
import { clone, merge, template } from 'lodash-es';
import m from 'mithril';
import { promiseUtil } from 'store';
import api from './api';
import pipelineUtil from './pipelineUtil';

export default declare([], {
  initialTasksState: {
    init: {
      id: 'init',
      name: '',
      nlsTaskName: 'apiInitialized', // nlsString
      width: '50%', // max width / nr of tasks,
      order: 1,
      status: '', // started, progress, done
      message: '',
    },
    fileprocess: {
      id: 'fileprocess',
      name: '',
      nlsTaskName: 'apiGenerationTask', // nlsString
      width: '50%', // max width / nr of tasks,
      order: 2,
      status: '',
      message: '',
    },
  },
  show(params) {
    this.noOfFiles = 0;
    this.progressDialog = new ProgressDialog();
    this.mode = params.mode; // check and remove
    if (params.mode && params.mode === 'new') {
      this.distributionRow = params.distributionRow;
      this.datasetRow = params.datasetRow;
    } else {
      this.apiDistEntry = params.apiDistrEntry;
    }
    this.distributionEntry = params.distributionEntry;
    this.datasetEntry = params.datasetEntry;
    this.escaApiProgress = params.escaApiProgress;
    this.escaFiles = params.escaFiles;
    this.escaApiProgress = params.escaApiProgress;
    this.validateFiles()
      .then(this._show.bind(this))
      .then(this.generateAPI.bind(this));
  },
  _show() {
    this.progressDialog.show();
    this.initialTasksState.init.name =
      this.escaApiProgress[this.initialTasksState.init.nlsTaskName];
    this.initialTasksState.fileprocess.name =
      this.escaApiProgress[this.initialTasksState.fileprocess.nlsTaskName];
    this.tasks = this.initialTasksState;
    this.updateProgressDialog(this.tasks);
  },
  updateProgressDialog(tasks, updateFooter = false, errorMessage = null) {
    const modalBody = this.progressDialog.getModalBody();
    const getObjectValues = x => Object.keys(x).reduce((y, z) => y.push(x[z]) && y, []);
    m.render(modalBody, m(TaskProgress, { tasks: getObjectValues(tasks) }));
    if (updateFooter) {
      this.showFooterResult(errorMessage);
    }
  },
  generateAPI() {
    if (this.mode === 'edit') {
      this.reActivateAPI();
      return;
    }
    this.activateAPI();
  },
  validateFiles() {
    const esu = registry.get('entrystoreutil');
    const fileStmts = this.distributionEntry.getMetadata().find(
      this.distributionEntry.getResourceURI(), 'dcat:downloadURL');
    this.totalNoFiles = fileStmts.length;
    this.fileURIs = fileStmts.map(fileStmt => fileStmt.getValue());
    const dialogs = registry.get('dialogs');
    let totalFilesSize = 0;
    const uri2FileDetails = {};
    const promises = this.fileURIs.map(tempFileURI =>
      esu.getEntryByResourceURI(tempFileURI).then((fEntry) => {
        const format = fEntry.getEntryInfo().getFormat();
        const sizeOfFile = fEntry.getEntryInfo().getSize();
        uri2FileDetails[tempFileURI] = { format, sizeOfFile };
      }));
    return Promise.all(promises).then(() => {
      Object.keys(uri2FileDetails).forEach((ruri) => {
        if (uri2FileDetails[ruri].sizeOfFile) {
          totalFilesSize += uri2FileDetails[ruri].sizeOfFile;
        }
      });
      if (config.catalog && totalFilesSize > config.catalog.maxFileSizeForAPI) {
        return dialogs.acknowledge(
          template(
            this.escaFiles.activateAPINotAllowedFileToBig)({ size: config.catalog.maxFileSizeForAPI }))
          .then(() => {
            throw new Exception('Stop reactivation, file(s) to big');
          });
      }
      const rURIs = Object.keys(uri2FileDetails);
      const format = rURIs.every(rURI => uri2FileDetails[rURI].format === 'text/csv');
      if (!format) {
        return dialogs.confirm(
          template(
            this.escaFiles.onlyCSVSupported)({ format: format || '-' }),
          this.escaFiles.confirmAPIActivation,
          this.escaFiles.abortAPIActivation);
      }
      return '';
    });
  },
  updateProgressDialogState(state = {}, hasError = false, errorMessage = '') {
    this.tasks = merge(this.tasks, state);
    this.updateProgressDialog(this.tasks, hasError, errorMessage);
  },
  _processFiles(fileResourceURIs, pres) {
    const esu = registry.get('entrystoreutil');
    const async = registry.get('asynchandler');
    async.addIgnore('execute', true, true);
    /**
     *  For each of the files uris execute the pipeline sequentially
     */
    return promiseUtil.forEach(fileResourceURIs, fileResourceURI =>
      esu.getEntryByResourceURI(fileResourceURI)
        .then(fEntry => pres.execute(fEntry, {}))
        .then(result => this.checkApiStatus(result[0]))
        .then(() => {
          // this.updateUI(); file processed with message
          this.noOfFiles += 1;
          const apiFileProcessed = i18n.renderNLSTemplate(this.escaApiProgress.apiFileProcessed,
            { number: this.noOfFiles, totalFiles: this.totalNoFiles });
          this.updateProgressDialogState({
            fileprocess: {
              message: apiFileProcessed,
            },
          });
        })
        .catch((err) => {
          // TODO Failure
          this.updateProgressDialogState({
            fileprocess: {
              status: 'failed',
            },
          }, true, this.escaApiProgress.apiProgressError); // change with nls
          throw err;
        }));
  },
  _createDistribution(pres) {
    this.distributionRow.createDistributionForAPI(pres).then(() => {
      this.tasks.fileprocess.status = 'done';
      this.updateProgressDialog(this.tasks);
      this.showFooterResult();
      this.datasetRow.fileEntryURIs.push(this.distributionEntry.getResourceURI());
      this.distributionRow.clearDropdownMenu();
      this.distributionRow.renderDropdownMenu();
      // this.datasetRow.showDistributionInList(apiDistributionEntry);
      this.datasetRow.clearDistributions();
      this.datasetRow.listDistributions();
    });
  },
  async activateAPI() {
    this.noOfCompletedTasks = 0;
    const async = registry.get('asynchandler');
    async.addIgnore('execute', true, true);
    let tempFileURIs = clone(this.fileURIs);

    try {
      /**
       * // TODO type
       * @type store/Pipeline
       */
      const pipelineResource = await pipelineUtil.getPipelineResource();
      this.updateProgressDialogState({ init: { status: 'progress' } });

      /**
       *
       * @param resource
       * @returns {*}
       */
      const transformId = pipelineResource.getTransformForType(pipelineResource.transformTypes.ROWSTORE);
      pipelineResource.setTransformArguments(transformId, {});
      pipelineResource.setTransformArguments(transformId, { action: 'create' });
      await pipelineResource.commit();

      /**
       * @returns {entryPromise}
       */
      const esu = registry.get('entrystoreutil');
      const fileEntry = await esu.getEntryByResourceURI(tempFileURIs[0]);

      /**
       *
       * @param entry
       * @returns {*}
       */
      const pipelineResult = await pipelineResource.execute(fileEntry, {});
      this.updateProgressDialogState({
        init: { status: 'done' },
        fileprocess: { status: 'progress' },
      });

      /**
       *
       * @param result
       * @returns {store|Entry|entryPromise|*|*}
       */
      tempFileURIs = tempFileURIs.slice(1); // remove first file entry
      if (tempFileURIs.length === 0) {
        this._createDistribution(pipelineResult[0]);
      } else {
        const pipelineResultEntry = await registry.get('entrystore').getEntry(pipelineResult[0]);

        /**
         *
         * @param pipelineResultEntry
         * @returns {Promise<any | never>}
         */
        pipelineResource.setTransformArguments(transformId, {});
        pipelineResource.setTransformArguments(transformId, {
          action: 'append',
          datasetURL: pipelineResultEntry.getResourceURI(), // pipelineResultEntryURI
        });
        await pipelineResource.commit();

        /**
         * processFiles
         * @returns {Promise<any | never>}
         */
        this.noOfFiles += 1;
        this.updateProgressDialogState({
          fileprocess: {
            message: i18n.renderNLSTemplate(this.escaApiProgress.apiFileProcessed, {
              number: this.noOfFiles,
              totalFiles: this.totalNoFiles,
            }),
          },
        });
        await this._processFiles(tempFileURIs, pipelineResource);

        /**
         * createDistribution
         */
        this._createDistribution(pipelineResult[0]);
      }
    } catch (err) {
      const message = this.escaApiProgress.apiProgressError;
      this.updateProgressDialogState({ fileprocess: { status: 'failed' } }, true, message);
    }
    /**
     * @param err
     */
    // const handleErrors = (err) => {
    //   if (err !== 'file') { // TODO remove
    //     const message = this.NLSLocalized.escaApiProgress.apiProgressError;
    //     this.updateProgressDialogState({ fileprocess: { status: 'failed' } }, true, message);
    //   }
    // };

    /**
     * Activate API process
     */
    //pipelineResourcePromise
    //  .then(updateTransformType)
    // .then(getEntryByResourceURI)
    //.then(executePipeline)
    //.then(getFileEntry)
    //.then(updateTransformArgs)
    //.then(processFiles)
    //.then(createDistribution)
    //.catch(handleErrors);
  },
  updateApiDistribution() {
    const distMetadata = this.apiDistEntry.getMetadata();
    const distResourceURI = this.apiDistEntry.getResourceURI();
    distMetadata.findAndRemove(distResourceURI, 'dcterms:modified');
    distMetadata.addD(distResourceURI, 'dcterms:modified', stamp.toISOString(new Date()), 'xsd:date');
    const apiURI = distMetadata.findFirstValue(distResourceURI, 'dcat:accessURL');
    if (apiURI) { // Should never fail for API distributions.
      const swaggerURI = `${apiURI}/swagger`;
      distMetadata.findAndRemove(distResourceURI, 'dcterms:conformsTo', swaggerURI);
      distMetadata.add(distResourceURI, 'dcterms:conformsTo', swaggerURI);
    }
    return this.apiDistEntry.commitMetadata();
  },
  reActivateAPI() {
    this.noOfCompletedTasks = 0;
    this.getPipelineResource().then((pres) => {
      const esu = registry.get('entrystoreutil');
      let tempFileURIs = clone(this.fileURIs);
      const async = registry.get('asynchandler');
      async.addIgnore('execute', true, true);
      esu.getEntryByResourceURI(tempFileURIs[0]).then((fileEntry) => {
        const transformId = pres.getTransformForType(pres.transformTypes.ROWSTORE);
        const etlEntryResourceURI = this.apiDistEntry.getMetadata()
          .findFirstValue(null, 'dcat:accessURL');
        pres.setTransformArguments(transformId, {});
        pres.setTransformArguments(transformId, {
          action: 'replace',
          datasetURL: etlEntryResourceURI, // etl Entry
        });
        pres.commit().then(() => {
          this.tasks.init.status = 'done';
          this.tasks.fileprocess.status = 'progress';
          this.updateProgressDialog(this.tasks);
          pres.execute(fileEntry, {}).then((result) => {
            this.checkApiStatus(result[0]).then(() => {
              tempFileURIs = tempFileURIs.slice(1); // remove first file entry
              if (tempFileURIs.length === 0) {
                // domAttr.remove(this.__doneButton, 'disabled');
                this.tasks.fileprocess.status = 'done';
                this.updateProgressDialog(this.tasks);
                // check here
                return this.updateApiDistribution().then(() => {
                  this.showFooterResult();
                });
              }
              pres.setTransformArguments(transformId, {});
              pres.setTransformArguments(transformId, {
                action: 'append',
                datasetURL: etlEntryResourceURI, // etlEntry
              });
              pres.commit().then(() => {
                this.noOfFiles += 1;
                const apiFileProcessed = i18n.renderNLSTemplate(
                  this.escaApiProgress.apiFileProcessed,
                  { number: this.noOfFiles, totalFiles: this.totalNoFiles },
                );
                this.tasks.fileprocess.message = apiFileProcessed;
                this.updateProgressDialog(this.tasks);
                this._processFiles(tempFileURIs, pres).then(() => {
                  this.tasks.fileprocess.status = 'done';
                  this.updateProgressDialog(this.tasks);
                  this.updateApiDistribution().then(() => {
                    this.showFooterResult();
                  });
                });
              });
            }, () => {
              // TODO Error code here
              this.tasks.fileprocess.status = 'failed';
              this.updateProgressDialog(this.tasks, true,
                this.escaApiProgress.apiProgressError);
            });
          }, (err) => {
            this.tasks.fileprocess.status = 'failed';
            this.updateProgressDialog(this.tasks, true, err.message);
          });
        });
      });
    });
  },
  checkApiStatus(etlEntryURI) {
    let counter = 30;
    return new Promise((resolve, reject) => {
      const f = this._getApiStatus(etlEntryURI).then((status) => {
        switch (status) {
          case 'available':
            resolve();
            break;
          case 'error':
            reject();
            break;
          default:
            if (counter > 0) {
              counter -= 1;
              setTimeout(f, 1000);
            } else {
              reject();
            }
        }
      });
    });
  },
  _getApiStatus(etlEntryURI) {
    const es = registry.get('entrystore');
    // eslint-disable-next-line arrow-body-style
    return es.getEntry(etlEntryURI)
      .then(etlEntry => api.load(etlEntry))
      .then((data) => {
        const status = api.status(data);
        if (status !== api.oldStatus(etlEntry)) {
          return api.update(etlEntry, data).then(() => status);
        }
        return status;
      });
  },
  showFooterResult(message = null) {
    const modalFooter = this.progressDialog.getModalFooter();
    const onclick = this.progressDialog.hide.bind(this.progressDialog);
    m.render(modalFooter, m(Row, {
      classNames: ['spaSideDialogFooter'],
      columns: [{
        size: 12,
        value: [
          m(Button, {
            element: 'button',
            type: message ? 'default' : 'primary',
            classNames: ['pull-right', 'col-md-2'],
            text: message ?
              this.escaApiProgress.nlsProgressCancel : this.escaApiProgress.nlsProgressDone,
            onclick,
          }),
          m(Alert, {
            element: 'span',
            type: message ? 'danger' : 'success',
            classNames: ['pull-left', 'col-md-8'],
            text: message || this.escaApiProgress.nlsProgressSuccess,
            children: null,
          })],
      }],
    }));
  },
  done() {
    this.progressDialog.hide();
  },
});

