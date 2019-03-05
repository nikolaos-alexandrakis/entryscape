import m from 'mithril';
import { createSetState } from 'commons/util/util';
import registry from 'commons/registry';
import { i18n } from 'esi18n';
import dateUtil from 'commons/util/dateUtil';
import StatBox from 'commons/overview/components/StatBox';
import Toggle from 'commons/components/common/toggle/Toggle';
import DistributionList from '../DistributionList';
import MoreMetadata from '../MoreMetadata';
import Button from '../Button';
import escaPublicNLS from 'catalog/nls/escaPublic.nls';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import {
  getTitle,
  getModifiedDate,
} from 'commons/util/metadata';
import bindActions from './actions';
import './index.scss';

export default (vnode) => {
  const { entry } = vnode.attrs;
  const resourceURI = entry.getResourceURI();
  const getProperty = (metadata, prop) => metadata.findFirstValue(resourceURI, prop);

  const state = {
    isHidden: true,
    isPublish: false,
    isPsiPublish: false,
  };
  const setState = createSetState(state);
  const actions = bindActions(entry, vnode.dom);

  const toggleMetadata = () => {
    setState({ isHidden: !state.isHidden });
  };

  const togglePublish = () => {
    setState({ isPublish: !state.isPublish });
  };

  const togglePsiPublish = () => {
    setState({ isPsiPublish: !state.isPsiPublish });
  };

  return {
    view: () => {
      const entryInfo = entry.getEntryInfo();
      const metadata = entry.getMetadata();

      const comments = entry.getComments();
      const title = metadata.findFirstValue(resourceURI, 'dcterms:title');
      const lastUpdatedDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));
      const description = metadata.findFirstValue(resourceURI, 'dcterms:description');
      const theme = getProperty(metadata, 'dcat:theme');
      const themeChoices = registry.get('itemstore').getItem('dcat:theme-isa').getChoices();
      const themeLabels = themeChoices.find(choice => choice.value === theme);

      const escaDataset = i18n.getLocalization(escaDatasetNLS);
      const escaPublic = i18n.getLocalization(escaPublicNLS);
      const publishToggleString = state.isPublish ? escaDataset.publishedTitle : escaDataset.unpublishedTitle;

      return (
        <main class="overview__wrapper">
          <div class="flex--sb">
            <div class="metadata--wrapper">
              <div class="intro--wrapper">
                <h2 class="title">{ title }</h2>
                <p class="description">{ description }</p>
              </div>
              <div class="metadata--basic">
                <p><span class="metadata__label">{escaPublic.datasetBelongsToCatalog}</span> Name of catalog</p>
                { theme &&
                  <p><span class="metadata__label">{escaDataset.themeTitle}:</span> {themeLabels.label[i18n.getLocale()]}</p>
                }
                <p><span class="metadata__label">{escaDataset.lastUpdateLabel}:</span> {lastUpdatedDate.short}</p>
                <p><span class="metadata__label">{escaDataset.editedTitle}</span> Althea Espejo, Valentino Hudra</p>
              </div>
            </div>

            <div class="btn__wrapper">
              <Button class="btn--edit" onclick={actions.openEditDialog}>{escaDataset.editDatasetTitle}</Button>
              <Button class="btn--show" onclick={toggleMetadata}>{escaDataset.showMoreTitle}</Button>
              <div class=" externalPublish flex--sb">
                <div class="icon--wrapper">
                  <span class="icons fa fa-globe"></span>
                  <p>{publishToggleString}</p>
                </div>
                <Toggle isEnabled={state.isPublish} onToggle={togglePublish}></Toggle>
              </div>
              <div class="psiPublish flex--sb">
                <div class="icon--wrapper">
                  <span class="icons fa fa-eye"></span>
                  <p>{escaDataset.psiDatasetTitle}</p>
                </div>
                <Toggle isEnabled={state.isPsiPublish} onToggle={togglePsiPublish}></Toggle>
              </div>
            </div>
          </div>

          <div class="metadata--wrapper">
            <MoreMetadata isHidden={state.isHidden} metadata={entryInfo}></MoreMetadata>
          </div>

          <div class="flex--sb">
            <DistributionList dataset={entry}></DistributionList>
            <div class="cards--wrapper">
              <StatBox value={comments.length} label={escaDataset.commentMenu} link=""/>
              <StatBox value="2" label={escaDataset.showideas} link=""/>
              <StatBox value="0" label={escaDataset.showresults} link=""/>
            </div>


          </div>


        </main>
      );
    },
  };
};
