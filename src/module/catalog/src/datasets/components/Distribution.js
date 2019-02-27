import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import { i18n } from 'esi18n';
import { engine, utils as rdformsUtils } from 'rdforms';
import { createSetState } from 'commons/util/util';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import escoListNLS from 'commons/nls/escoList.nls';
import declare from 'dojo/_base/declare';
import DOMUtil from 'commons/util/htmlUtil';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import RevisionsDialog from 'catalog/datasets/RevisionsDialog';
import ApiInfoDialog from 'catalog/datasets/ApiInfoDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import {
  isUploadedDistribution,
  isFileDistributionWithOutAPI,
  isSingleFileDistribution,
  isAPIDistribution,
  isAccessURLEmpty,
  isDownloadURLEmpty,
  isAccessDistribution,
  getDistributionTemplate,
} from 'catalog/datasets/utils/distributionUtil';
import DistributionActions from './DistributionActions';
import GenerateAPI from '../GenerateAPI';

export default (vnode) => {
  const { distribution, dataset, fileEntryURIs } = vnode.attrs;
  const state = {
    isExpanded: false,
  };

  const setState = createSetState(state);

  const namespaces = registry.get('namespaces');

  const EditDistributionDialog = declare([RDFormsEditDialog, ListDialogMixin], {
    maxWidth: 800,
    explicitNLS: true,
    open(params) {
      const escaDataset = i18n.getLocalization(escaDatasetNLS);
      this.inherited(arguments);

      const entry = params.row.entry;
      this.distributionEntry = entry;
      this.set('title', escaDataset.editDistributionHeader);
      this.set('doneLabel', escaDataset.editDistributionButton);
      this.doneLabel = escaDataset.editDistributionButton;
      this.title = escaDataset.editDistributionHeader;
      this.updateTitleAndButton();
      registry.set('context', entry.getContext());
      if (isUploadedDistribution(entry, registry.get('entrystore')) ||
      isAPIDistribution(entry)) {
        this.editor.filterPredicates = {
          'http://www.w3.org/ns/dcat#accessURL': true,
          'http://www.w3.org/ns/dcat#downloadURL': true,
        };
      } else {
        this.editor.filterPredicates = {};
      }
      entry.setRefreshNeeded();
      entry.refresh().then(() => {
        this.showEntry(
          entry, getDistributionTemplate(config.catalog.distributionTemplateId), 'mandatory');
      });
    },
    doneAction(graph) {
      this.distributionEntry.setMetadata(graph);
      return this.distributionEntry.commitMetadata().then(() => {
        m.redraw();
      });
    },
  });

  // ACTIONS
  const editDistribution = () => {
    const editDialog = new EditDistributionDialog({}, DOMUtil.create('div', null, vnode.dom));
    // TODO @scazan Some glue here to communicate with RDForms without a "row"
    editDialog.open({ row: { entry: distribution }, onDone: () => listDistributions(dataset) });
  };

  const openResource = () => {
    openNewTab(distribution);
  };

  const openApiInfo = () => {
    const apiInfoDialog = new ApiInfoDialog({}, DOMUtil.create('div', null, vnode.dom));
    getEtlEntry(distribution).then((etlEntry) => {
      apiInfoDialog.open({ etlEntry, apiDistributionEntry: distribution });
    });
  };

  const activateAPI = () => {
    const generateAPI = new GenerateAPI();
    generateAPI.execute({
      params: {
        distribution,
        dataset,
        mode: 'new',
        fileEntryURIs,
      },
    });
  };

  const refreshAPI = () => {
    const apiDistributionEntry = distribution;
    const esUtil = registry.get('entrystoreutil');
    const sourceDistributionResURI = apiDistributionEntry
      .getMetadata()
      .findFirstValue(
        apiDistributionEntry.getResourceURI(),
        registry.get('namespaces').expand('dcterms:source'),
      );
    return esUtil.getEntryByResourceURI(sourceDistributionResURI).then((sourceDistributionEntry) => {
      const generateAPI = new GenerateAPI();
      generateAPI.execute({
        params: {
          apiDistEntry: apiDistributionEntry,
          distributionEntry: sourceDistributionEntry,
          dataset,
          mode: 'refresh',
          fileEntryURIs,
        },
      });
    });
  };

  const openRevisions = () => {
    const dv = RevisionsDialog;
    if (isUploadedDistribution(distribution, registry.get('entrystore'))) {
      dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL'];
    } else if (isAPIDistribution(distribution)) {
      dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL', 'dcterms:source'];
    } else {
      dv.excludeProperties = [];
    }
    dv.excludeProperties = dv.excludeProperties.map(property => registry.get('namespaces').expand(property));

    const revisionsDialog = new RevisionsDialog({}, DOMUtil.create('div', null, vnode.dom));
    // @scazan Some glue here to communicate with RDForms without a "row"
    revisionsDialog.open({
      row: { entry: distribution },
      onDone: () => m.redraw(),
      template: getDistributionTemplate(config.catalog.distributionTemplateId),
    });
  };

  /*
   This deletes selected distribution and also deletes
   its relation to dataset
   */
  const removeDistribution = (distributionEntry, datasetEntry) => {
    const resURI = distributionEntry.getResourceURI();
    const entryStoreUtil = registry.get('entrystoreutil');
    const fileStmts = distributionEntry.getMetadata().find(distributionEntry.getResourceURI(), 'dcat:downloadURL');
    const fileURIs = fileStmts.map(fileStmt => fileStmt.getValue());
    distributionEntry.del().then(() => {
      datasetEntry.getMetadata().findAndRemove(null, registry.get('namespaces').expand('dcat:distribution'), {
        value: resURI,
        type: 'uri',
      });
      return datasetEntry.commitMetadata().then(() => {
        distributionEntry.setRefreshNeeded();
        return Promise.all(fileURIs.map(
          fileURI => entryStoreUtil.getEntryByResourceURI(fileURI)
            .then(fEntry => fEntry.del())),
        );
      });
    })
      .then(() => m.redraw());
  };
  const remove = () => {
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    const dialogs = registry.get('dialogs');
    // if (isFileDistributionWithOutAPI(this.entry, this.dctSource, registry.get('entrystore'))) {
    if (isFileDistributionWithOutAPI(distribution, fileEntryURIs, registry.get('entrystore'))) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          removeDistribution(distribution, dataset);
        });
    } else if (isAPIDistribution(distribution)) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          deactivateAPInRemoveDist(distribution, dataset);
        });
    } else if (isAccessDistribution(distribution, registry.get('entrystore'))) {
      dialogs.confirm(escaDataset.removeDistributionQuestion,
        null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          removeDistribution(distribution, dataset);
        });
    } else {
      dialogs.acknowledge(escaDataset.removeFileDistWithAPI);
    }
  };
  // END ACTIONS

  // UTILS
  const getEtlEntry = (entry) => {
    const md = entry.getMetadata();
    const esUtil = registry.get('entrystoreutil');
    const pipelineResultResURI = md.findFirstValue(entry.getResourceURI(), registry.get('namespaces').expand('dcat:accessURL'));
    return esUtil.getEntryByResourceURI(pipelineResultResURI)
      .then(pipelineResult => new Promise(r => r(pipelineResult)));
  };

  /*
   * This deletes the selected API distribution. It also deletes relation to dataset,
   * corresponding API, pipelineResultEntry.
   */
  const deactivateAPInRemoveDist = (distributionEntry, datasetEntry) => {
    const resURI = distributionEntry.getResourceURI();
    const es = distributionEntry.getEntryStore();
    const contextId = distributionEntry.getContext().getId();
    distributionEntry.del().then(() => {
      datasetEntry.getMetadata().findAndRemove(null, registry.get('namespaces').expand('dcat:distribution'), {
        value: resURI,
        type: 'uri',
      });
      datasetEntry.commitMetadata().then(() => {
        getEtlEntry(distributionEntry).then((etlEntry) => {
          const uri = `${es.getBaseURI() + contextId}/resource/${etlEntry.getId()}`;
          return es.getREST().del(`${uri}?proxy=true`)
            .then(() => etlEntry.del().then(() => {
              m.redraw();
            }));
        });
      });
    });
  };
  // END UTILS

  const getTitle = (entry, namespaces) => {
    const escaDatasetLocalized = i18n.getLocalization(escaDatasetNLS);

    const md = entry.getMetadata();
    const subj = entry.getResourceURI();
    const title = md.findFirstValue(subj, namespaces.expand('dcterms:title'));
    const downloadURI = md.findFirstValue(subj, namespaces.expand('dcat:downloadURL'));
    const source = md.findFirstValue(subj, namespaces.expand('dcterms:source'));
    if (title == null) {
      if (downloadURI != null && downloadURI !== '') {
        return escaDatasetLocalized.defaultDownloadTitle;
      } else if (source != null && source !== '') {
        return escaDatasetLocalized.autoGeneratedAPI;
      }

      return escaDatasetLocalized.defaultAccessTitle;
    }

    return title;
  };

  const getDistributionMetadata = (entry, namespaces) => {
    const md = entry.getMetadata();
    const subj = entry.getResourceURI();
    const accessURI = md.findFirstValue(subj, namespaces.expand('dcat:accessURL'));
    const downloadURI = md.findFirstValue(subj, namespaces.expand('dcat:downloadURL'));
    const description = md.findFirstValue(subj, namespaces.expand('dcterms:description'));

    // @scazan WHAT IS TEMPLATE DRIVEN FORMAT?
    let format;
    // Check for template driven format
    const formatTemplate = config.catalog.formatTemplateId
      ? registry
        .get('itemstore')
        .getItem(config.catalog.formatTemplateId)
      : undefined;
    if (formatTemplate) {
      format = rdformsUtils.findFirstValue(engine, md, subj, formatTemplate);
    }
    // Alternatively check for pure value via array of properties
    if (!format && config.catalog.formatProp) {
      const formatPropArr = typeof config.catalog.formatProp === 'string'
        ? [config.catalog.formatProp]
        : config.catalog.formatProp;
      formatPropArr.find((prop) => {
        format = md.findFirstValue(subj, namespaces.expand(prop));
        return format != null;
      });
    }

    const modificationDate = entry
      .getEntryInfo()
      .getModificationDate();
    // this.renderDate(); this.clearDropdownMenu(); this.renderDropdownMenu();

    return { format, modificationDate, accessURI, downloadURI, description };
  };

  const expandDistribution = () => {
    setState({
      isExpanded: !state.isExpanded,
    });
  };

  return {
    view: (vnode) => {
      const { distribution, dataset, fileEntryURIs } = vnode.attrs;

      const title = getTitle(distribution, namespaces);
      const {
        format,
        modificationDate,
        accessURI,
        downloadURI,
        description,
      } = getDistributionMetadata(distribution, namespaces);

      const expandedClass = state.isExpanded ? 'expanded' : '';
      const distributionArrowClass = state.isExpanded ? 'fa-angle-up' : 'fa-angle-down';
      const escaDataset = i18n.getLocalization(escaDatasetNLS);
      const escoList = i18n.getLocalization(escoListNLS);

      return (
        <div>
          <div tabindex="0" class="distribution__row flex--sb" onclick={expandDistribution}>
            <div class="distribution__format">
              <p class="distribution__title">{title}</p>
              <p class="file__format">
                <span class="file__format--short">{format}</span>
              </p>
            </div>
            <div class="flex--sb">
              <p class="distribution__date">Jan 17</p>
              <span class={`icons fa ${distributionArrowClass}`}></span>
            </div>
          </div>

          <div class={`distribution__expand ${expandedClass}`}>
            <div>
              <div class="flex--sb">
                <div class="metadata--wrapper">
                  { description &&
                    <div class="distribution__description">
                      <h2 class="title">{escaDataset.distributionDescriptionTitle}</h2>
                      <p class="text">
                        { description }
                      </p>
                    </div>
                  }
                  <div class="distribution__format">
                    <h2 class="title">{escaDataset.distributionFormatTitle}</h2>
                    <p class="text">{ i18n.renderNLSTemplate(escaDataset.distributionFiles, { numFiles: 2 }) }</p>
                  </div>
                </div>
                <div class="menu--wrapper">
                  <div class=" icon--wrapper distribution--file">
                    <a>
                      <button class=" btn--distribution"
                        onclick={editDistribution}
                      >
                        <span>{escaDataset.editDistributionTitle}</span>
                      </button>
                    </a>
                    <a>
                      <button class=" btn--distribution fa fa-fw fa-remove"
                        onclick={remove}
                      >
                        <span>{escaDataset.removeDistributionTitle}</span>
                      </button>
                    </a>

                    { distribution.getEntryInfo().hasMetadataRevisions() &&
                        <a>
                        <button
                          class=" btn--distribution fa fa-fw fa-bookmark"
                          title={escoList.versionsTitle}
                          onclick={openRevisions}
                        >
                          <span>{escoList.versionsLabel}</span>
                        </button>
                        </a>
                    }
                    { isAPIDistribution(distribution) && [
                      <a>
                        <button
                         class="btn--distribution fa fa-fw fa-info-circle"
                         title={escaDataset.apiDistributionTitle}
                         onclick={openApiInfo}
                        >
                          <span>{escaDataset.apiDistributionTitle}</span>
                        </button>
                      </a>,
                      <a>
                        <button
                         class="btn--distribution fa fa-fw fa-retweet"
                         title={escaDataset.reGenerateAPITitle}
                         onclick={refreshAPI}
                        >
                          <span>{escaDataset.reGenerateAPI}</span>
                        </button>
                      </a>
                    ]}
                  </div>
                </div>
              </div>
            </div>
            <div class="distribution__fileRow">
              <div class="distribution__format">
                <p class="distribution__title">{title}</p>
                <p class="file__format">
                  <span class="file__format--short">{format}</span>
                </p>
              </div>
              <DistributionActions
                distribution={distribution}
                dataset={dataset}
                nls={escaDataset}
                fileEntryURIs={fileEntryURIs}
              />
            </div>
          </div>
        </div>
      );
    },
  };
};
