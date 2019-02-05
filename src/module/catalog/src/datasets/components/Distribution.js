import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import {i18n} from 'esi18n';
import dateUtil from 'commons/util/dateUtil';
import {engine, utils as rdformsUtils} from 'rdforms';
import {template} from 'lodash-es';
import escaDataset from 'catalog/nls/escaDataset.nls';
import escoList from 'commons/nls/escoList.nls';
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
      } else {
        return escaDatasetLocalized.defaultAccessTitle;
      }
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

    return {format, modificationDate, accessURI, downloadURI};
  };

  const expandDistribution = () => {
    setState({
      isExpanded: !state.isExpanded
    });
  };

  const namespaces = registry.get('namespaces');

  return {
    view: (vnode) => {
      const {distribution} = vnode.attrs;
      const title = getTitle(distribution, namespaces);
      const {format, modificationDate, accessURI, downloadURI} = getDistributionMetadata(distribution, namespaces);
      const expandedClass = state.isExpanded? 'expanded' : '';
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
              <div class="metadata--wrapper">
                <div class="distribution__description">
                  <h2 class="title">{escaDataset.distributionDescriptionTitle}</h2>
                  <p class="text">
                    If there is a description it should be here. If not then don't show anything</p>
                </div>
                <div class="distribution__format">
                  <h2 class="title">{escaDataset.distributionFormatTitle}</h2>
                  <p class="text">This distribution has<span class="file__number">5</span>files</p>
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
