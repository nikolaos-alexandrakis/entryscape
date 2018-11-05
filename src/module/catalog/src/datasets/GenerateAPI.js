import registry from 'commons/registry';
import api from './api';
import pipelineUtil from './pipelineUtil';
import {promiseUtil} from 'store';
import ProgressDialog from 'commons/progresstask/ProgressDialog';
import TaskProgress from 'commons/progresstask/components/TaskProgress';
import Row from 'commons/components/common/grid/Row';
import Alert from 'commons/components/common/alert/Alert';
import Button from 'commons/components/common/button/Button';
import {clone, template} from 'lodash-es';
import {i18n} from 'esi18n';
import config from 'config';
import declare from 'dojo/_base/declare';
import stamp from 'dojo/date/stamp';
import m from 'mithril';

export default declare([], {
  initialTasksState: {
    init: {
      id: 'init',
      name: '',
      nlsTaskName: 'apiInitialized',  // nlsString
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
    this.tasks = clone(this.initialTasksState);
    this.updateProgressDialog(this.tasks);
  },
  updateProgressDialog(tasks, updateFooter = false, errorMessage = null) {
    const modalBody = this.progressDialog.getModalBody();
    const getObjectValues = x => Object.keys(x).reduce((y, z) => y.push(x[z]) && y, []);
    m.render(modalBody, m(TaskProgress, {tasks: getObjectValues(tasks)}));
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
        uri2FileDetails[tempFileURI] = {format, sizeOfFile};
      }));
    return Promise.all(promises).then(() => {
      Object.keys(uri2FileDetails).forEach((ruri) => {
        if (uri2FileDetails[ruri].sizeOfFile) {
          totalFilesSize += uri2FileDetails[ruri].sizeOfFile;
        }
      });
      if (config.catalog && totalFilesSize > config.catalog.maxFileSizeForAPI) {
        return dialogs.acknowledge(template(this.escaFiles.activateAPINotAllowedFileToBig)({size: config.catalog.maxFileSizeForAPI})).then(() => {
          throw new Exception('Stop reactivation, file(s) to big');
        });
      }
      rURIs = Object.keys(uri2FileDetails);
      const format = rURIs.every((rURI) => {
        fileFormat = uri2FileDetails[rURI].format;
        return (fileFormat === 'text/csv');
      });
      if (!format) {
        return dialogs.confirm(template(
          this.escaFiles.onlyCSVSupported)({format: format || '-'}),
          this.escaFiles.confirmAPIActivation,
          this.escaFiles.abortAPIActivation);
      }
      return '';
    });
  },
  getPipelineResource() {
    return pipelineUtil.getPipelineResource().then((pres) => {
      this.tasks.init.status = 'progress';
      this.updateProgressDialog(this.tasks);
      return pres;
    });
  },
  _processFiles(fileResourceURIs, pres) {
    const esu = registry.get('entrystoreutil');
    const async = registry.get('asynchandler');
    async.addIgnore('execute', true, true);
    return promiseUtil.forEach(fileResourceURIs, fileResourceURI =>
      esu.getEntryByResourceURI(fileResourceURI).then(fEntry =>
        pres.execute(fEntry, {}).then(result =>
          this.checkApiStatus(result[0]).then(() => {
            // this.updateUI(); file processed with message
            this.noOfFiles += 1;
            const apiFileProcessed = i18n.renderNLSTemplate(this.escaApiProgress.apiFileProcessed,
              {number: this.noOfFiles, totalFiles: this.totalNoFiles});
            this.tasks.fileprocess.message = apiFileProcessed;
            this.updateProgressDialog(this.tasks);
          }, (err) => {
            // TODO Failure
            this.tasks.fileprocess.status = 'failed';
            this.updateProgressDialog(this.tasks, true,
              this.escaApiProgress.apiProgressError); // change with nls
            throw err;
          }))));
  },
  _createDistribution(pres) {
    this.distributionRow.createDistributionForAPI(pres).then((apiDistributionEntry) => {
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
  activateAPI() {
    this.noOfCompletedTasks = 0;
    const async = registry.get('asynchandler');
    async.addIgnore('execute', true, true);
    this.getPipelineResource().then((pres) => {
      const es = registry.get('entrystore');
      const esu = registry.get('entrystoreutil');
      let tempFileURIs = clone(this.fileURIs);
      esu.getEntryByResourceURI(tempFileURIs[0]).then((fileEntry) => {
        const transformId = pres.getTransformForType(pres.transformTypes.ROWSTORE);
        pres.setTransformArguments(transformId, {});
        pres.setTransformArguments(transformId, {
          action: 'create',
        });
        pres.commit().then(() => {
          this.tasks.init.status = 'done';
          this.tasks.fileprocess.status = 'progress';
          this.updateProgressDialog(this.tasks);
          pres.execute(fileEntry, {}).then((result) => {
            this.checkApiStatus(result[0]).then(() => {
              tempFileURIs = tempFileURIs.slice(1); // remove first file entry
              if (tempFileURIs.length === 0) {
                this._createDistribution(result[0]);
                return;
              }
              es.getEntry(result[0]).then((etlEntry) => { // start
                pres.setTransformArguments(transformId, {});
                pres.setTransformArguments(transformId, {
                  action: 'append',
                  datasetURL: etlEntry.getResourceURI(), // etlEntry pipelineResultEntryURI
                });
                return pres.commit().then(() => {
                  this.noOfFiles += 1;
                  const apiFileProcessed = i18n.renderNLSTemplate(this.escaApiProgress.apiFileProcessed,
                    {number: this.noOfFiles, totalFiles: this.totalNoFiles});
                  this.tasks.fileprocess.message = apiFileProcessed;
                  this.updateProgressDialog(this.tasks);
                  this._processFiles(tempFileURIs, pres).then(() => {
                    // enable done button
                    this._createDistribution(result[0]);
                  });
                });
              });
              //
            }, () => {
              // TODO Error code here
              this.tasks.fileprocess.status = 'failed';
              this.updateProgressDialog(this.tasks, true,
                this.escaApiProgress.apiProgressError);
            });
          }, () => {
            this.tasks.fileprocess.status = 'failed';
            this.updateProgressDialog(this.tasks, true, this.escaApiProgress.apiProgressError);
          });
        });
      });
    });
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
          datasetURL: etlEntryResourceURI, //etl Entry
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
                  {number: this.noOfFiles, totalFiles: this.totalNoFiles},
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
    const f = (resolve, reject) => {
      this._getApiStatus(etlEntryURI).then((status) => {
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
      })
    };
    return new Promise(f);
  },
  _getApiStatus(etlEntryURI) {
    const es = registry.get('entrystore');
// eslint-disable-next-line arrow-body-style
    return es.getEntry(etlEntryURI).then((etlEntry) => {
      return api.load(etlEntry).then((data) => {
        const status = api.status(data);
        if (status !== api.oldStatus(etlEntry)) {
          return api.update(etlEntry, data).then(() => status);
        }
        return status;
      });
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

