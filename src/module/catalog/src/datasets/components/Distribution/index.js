import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import { i18n } from 'esi18n';
import { engine, utils as rdformsUtils } from 'rdforms';
import { createSetState } from 'commons/util/util';
import {
  isAPIDistribution,
} from 'catalog/datasets/utils/distributionUtil';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import escoListNLS from 'commons/nls/escoList.nls';
import DistributionActions from '../DistributionActions';
import bindActions from './actions';
import './index.scss';

export default (vnode) => {
  const { distribution, dataset, fileEntryURIs } = vnode.attrs;
  const state = {
    isExpanded: false,
  };
  const setState = createSetState(state);
  const actions = bindActions(distribution, dataset, fileEntryURIs, vnode.dom);

  const expandDistribution = () => {
    setState({
      isExpanded: !state.isExpanded,
    });
  };

  const getTitle = (entry) => {
    const namespaces = registry.get('namespaces');
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

  const getDistributionMetadata = (entry) => {
    const namespaces = registry.get('namespaces');
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

  return {
    view: (vnode) => {
      const title = getTitle(distribution);
      const {
        format,
        modificationDate,
        accessURI,
        downloadURI,
        description,
      } = getDistributionMetadata(distribution);

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
                    <DistributionActions
                      distribution={distribution}
                      dataset={dataset}
                      nls={escaDataset}
                      fileEntryURIs={fileEntryURIs}
                    />
                      <button class=" btn--distribution"
                        onclick={actions.editDistribution}
                      >
                        <span>{escaDataset.editDistributionTitle}</span>
                      </button>
                      <button class=" btn--distribution fa fa-fw fa-remove"
                        onclick={actions.remove}
                      >
                        <span>{escaDataset.removeDistributionTitle}</span>
                      </button>

                    { distribution.getEntryInfo().hasMetadataRevisions() &&
                        <button
                          class=" btn--distribution fa fa-fw fa-bookmark"
                          title={escoList.versionsTitle}
                          onclick={actions.openRevisions}
                        >
                          <span>{escoList.versionsLabel}</span>
                        </button>
                    }
                    { isAPIDistribution(distribution) && [
                        <button
                         class="btn--distribution fa fa-fw fa-info-circle"
                         title={escaDataset.apiDistributionTitle}
                         onclick={actions.openApiInfo}
                        >
                          <span>{escaDataset.apiDistributionTitle}</span>
                        </button>,
                        <button
                         class="btn--distribution fa fa-fw fa-retweet"
                         title={escaDataset.reGenerateAPITitle}
                         onclick={actions.refreshAPI}
                        >
                          <span>{escaDataset.reGenerateAPI}</span>
                        </button>
                    ]}
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
              <div class="cogwheelGoesHere"></div>
            </div>
          </div>
        </div>
      );
    },
  };
};
