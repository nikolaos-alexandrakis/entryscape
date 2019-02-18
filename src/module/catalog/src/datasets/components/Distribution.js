import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import {i18n} from 'esi18n';
import dateUtil from 'commons/util/dateUtil';
import {engine, utils as rdformsUtils} from 'rdforms';
import {template} from 'lodash-es';
import escaDataset from 'catalog/nls/escaDataset.nls';
import escoList from 'commons/nls/escoList.nls';
import { 
  isUploadedDistribution,
  isFileDistributionWithOutAPI,
  isSingleFileDistribution,
  isAPIDistribution,
  isAccessURLEmpty,
  isDownloadURLEmpty,
} from 'catalog/datasets/utils/distributionUtil';
import {createSetState} from 'commons/util/util';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';

export default() => {

  const state = {
    isExpanded: false
  };

  const setState = createSetState(state);

  const getTitle = (entry, namespaces) => {
    const escaDatasetLocalized = i18n.getLocalization(escaDataset);

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

  const getFormattedDates = (modDate) => {
    if (modDate != null) {
      const escoListLocalized = i18n.getLocalization(escoList);
      const dateFormats = dateUtil.getMultipleDateFormats(modDate);
      const tStr = template(escoListLocalized.modifiedDateTitle)({date: dateFormats.full});
      return dateFormats;
    }
    return null;
  };

  const getDistributionMetadata = (entry, namespaces) => {
    const md = entry.getMetadata();
    const subj = entry.getResourceURI();
    const accessURI = md.findFirstValue(subj, namespaces.expand('dcat:accessURL'));
    const downloadURI = md.findFirstValue(subj, namespaces.expand('dcat:downloadURL'));
    const description = md.findFirstValue(subj, namespaces.expand('dcat:description'));

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

    return {format, modificationDate, accessURI, downloadURI, description};
  };

  const expandDistribution = () => {
    setState({
      isExpanded: !state.isExpanded
    });
  };

  const renderActions = (entry, nls) => {
    const actions = [];
      // name: 'edit',
      // method: this.edit.bind(this),

    actions.push(
      <button
        class="btn--distributionFile fa fa-fw fa-pencil"
        title={nls.editDistributionTitle}
        onclick={()=>console.log('edit')}
      >
        <span>{nls.editDistributionTitle}</span>
      </button>
    );


    if (isUploadedDistribution(entry, registry.get('entrystore'))) { // added newly
      // Add ActivateApI menu item,if its fileEntry distribution
     /*  if (isFileDistributionWithOutAPI(entry, this.dctSource, registry.get('entrystore'))) {
          // name: 'activateAPI',
          // method: this.activateAPI.bind(this, entry),
        actions.push(
          <button 
            class="btn--distribution fa fa-fw fa-link"
            title={nls.apiActivateTitle}
            onclick={()=>console.log('activateAPI')}
          >
            <span>{nls.apiActivateTitle}</span>
          </button>
        );
      } */
      if (isSingleFileDistribution(entry)) {
          // nlsKeyTitle: 'downloadButtonTitle',
          // method: this.openNewTab.bind(this, entry),

          // name: 'replaceFile',
          // method: this.replaceFile.bind(this, entry),

          // name: 'addFile',
          // method: this.addFile.bind(this, entry),

        actions.push([
          <button
            class="btn--distributionFile fa fa-fw fa-download"
            title={nls.downloadButtonTitle}
            onclick={()=>console.log('download')}
          >
            <span>{nls.downloadButtonTitle}</span>
          </button>,
          <button 
            class="btn--distributionFile fa fa-fw fa-exchange"
            title={nls.replaceFileTitle}
            onclick={()=>console.log('replace')}
          >
            <span>{nls.replaceFile}</span>
          </button>,
          <button 
            class="btn--distributionFile fa fa-fw fa-file"
            title={nls.addFileTitle}
            onclick={()=>console.log('add file')}
          >
            <span>{nls.addFile}</span>
          </button>
        ]);
      } else {
          // name: 'manageFiles',
          // method: this.manageFiles.bind(this, entry),
        actions.push(
          <button
            class="btn--distributionFile fa fa-fw fa-files-o"
            title={nls.manageFilesTitle}
            onclick={()=>console.log('manage files')}
          >
            <span>{nls.manageFiles}</span>
          </button>
        );
      }
    } else if (isAPIDistribution(entry)) { // Add ApiInfo menu item,if its api distribution
        // name: 'apiInfo',
        // method: this.openApiInfo.bind(this, entry),

        // name: 'reGenerateAPI',
        // method: this.refreshAPI.bind(this, entry),

      actions.push([
        <button 
          class="btn--distributionFile fa fa-fw fa-info-circle"
          title={nls.apiDistributionTitle}
          onclick={()=>console.log('open api info')}
        >
          <span>{nls.apiDistributionTitle}</span>
        </button>,
        <button
          class="btn--distributionFile  fa fa-fw fa-retweet"
          title={nls.reGenerateAPITitle}
          onclick={()=>console.log('Regenerate api')}
        >
          <span>{nls.reGenerateAPI}</span>
        </button>
      ]);

    } else {
      if (!isAccessURLEmpty(entry)) {
          // name: 'access',
          // method: this.openNewTab.bind(this, entry),
      actions.push(
        <button
          class="btn--distributionFile fa fa-fw fa-info-circle"
          title={nls.accessURLButtonTitle}
          onclick={()=>console.log('access')}
        >
          <span>{nls.accessURLButtonTitle}</span>
        </button>
      );
      }
      if (!isDownloadURLEmpty(entry)) {
          // name: 'download',
          // method: this.openNewTab.bind(this, entry),
      actions.push(
        <button 
          class="btn--distributionFile  fa fa-fw fa-download"
          title={nls.downloadButtonTitle}
          onclick={()=>console.log('download')}
        >
          <span>{nls.downloadButtonTitle}</span>
        </button>
      );
      }
    }
    // Versions for other dist
    if (entry.getEntryInfo().hasMetadataRevisions()) {
        // name: 'versions',
        // method: this.openVersions.bind(this, entry),
      actions.push(
        <button
<<<<<<< HEAD
          class=" btn--distribution fa fa-fw fa-bookmark"
          title={nls.versionsTitle} // This comes out of escoList so a different nls bundle needs to be passed in
=======
          class="btn--distributionFile fa fa-fw fa-bookmark"
          title={nls.versionsTitle}
>>>>>>> 68b72443b95d12f351b2a628d38e137184c64d16
          onclick={() => console.log('versions')}
        >
          <span>{nls.versionsLabel}</span>
        </button>
      );
    }
    // if (this.datasetRow.list.createAndRemoveDistributions) {
    if (false==true) {
        // name: 'remove',
        // method: this.remove.bind(this),
      actions.push(
        <button
          class=" btn--distributionFile fa fa-fw fa-remove"
          title={nls.removeDistributionTitle}
          onclick={() => console.log('remove')}
        >
          <span>{nls.removeDistributionTitle}</span>
        </button>
      );
    }

    return actions;
  };

  const namespaces = registry.get('namespaces');

  return {
    view: (vnode) => {
      const {distribution, fileEntryURIs} = vnode.attrs;
      const title = getTitle(distribution, namespaces);
      const {
        format,
        modificationDate,
        accessURI,
        downloadURI,
        description,
      } = getDistributionMetadata(distribution, namespaces);

      const expandedClass = state.isExpanded ? 'expanded' : '';
      const escaDataset = i18n.getLocalization(escaDatasetNLS);

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
                <span class="icons fa fa-angle-down"></span>
              </div>
            </div>

          <div class={`distribution__expand ${expandedClass}`}>
            <div class="flex--sb">
            <div>
              <div class="metadata--wrapper">
                <div class="distribution__description">
                  <h2 class="title">{escaDataset.distributionDescriptionTitle}</h2>
                  <p class="text">
                    If there is a description it should be here. If not then don't show anything</p>
                </div>
                <div class="distribution__format">
                  <h2 class="title">{escaDataset.distributionFormatTitle}</h2>
                  <p class="text">{ i18n.renderNLSTemplate(escaDataset.distributionFiles, {numFiles: 2}) }</p>
                </div>
              </div>
              <div class="distribution__fileRow">
                <div class="distribution__format">
                <p class="distribution__title">{title}</p>
                <p class="file__format">
                  <span class="file__format--short">{format}</span>
                </p>
                </div>
                <div class="flex--sb">
                  <p class="distributionFile__date">Jan 17</p>
                  <button class="icons fa fa-cog"></button>
                </div>
                <div class="dropdownMenu">
                { renderActions(distribution, escaDataset) }
              </div>
              </div>

            </div>

              <div class="menu--wrapper">
                <div class=" icon--wrapper distribution--file">
                
                  <a>
                    <button class=" btn--distribution">
                      <span>{escaDataset.editDistributionTitle}</span>
                    </button>
                  </a>
                  <a>
                    <button class=" btn--distribution fa fa-fw fa-remove">
                      <span>{escaDataset.removeDistributionTitle}</span>
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
};
