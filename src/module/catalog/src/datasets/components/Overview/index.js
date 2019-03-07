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
import escoListNLS from 'commons/nls/escoList.nls';
import {
  getTitle,
  getModifiedDate,
  getThemeLabels,
} from 'commons/util/metadata';
import bindActions from './actions';
import './index.scss';


export default (vnode) => {
  const { entry } = vnode.attrs;
  const resourceURI = entry.getResourceURI();
  const getProperty = (metadata, prop) => metadata.findFirstValue(resourceURI, prop);
  const entryInfo = entry.getEntryInfo();

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

  const rdfutils = registry.get('rdfutils');


  let catalogEntry;
  let contributors;
  const getParentCatalogEntry = () => registry.get('entrystoreutil').getEntryByType('dcat:Catalog', entry.getContext())
    .then((entry) => {
      catalogEntry = entry;
      m.redraw();
    });
  const getContributors = () => {
    const es = registry.get('entrystore');
    const contributorsEntryURIs = entryInfo.getContributors()
      .map(contributorURI => es.getEntryURIFromURI(contributorURI) );

    return Promise.all(contributorsEntryURIs.map( uri => es.getEntry(uri)));
  };

  return {
    oninit() {
      getParentCatalogEntry();
      getContributors().then((entries) => {
        contributors = entries;
        m.redraw();
      });
    },
    view: () => {
      const metadata = entry.getMetadata();

      const comments = entry.getComments();
      const title = metadata.findFirstValue(resourceURI, 'dcterms:title');
      const lastUpdatedDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));
      const description = metadata.findFirstValue(resourceURI, 'dcterms:description');
      const themes = getThemeLabels(entry);

      const escaDataset = i18n.getLocalization(escaDatasetNLS);
      const escaPublic = i18n.getLocalization(escaPublicNLS);
      const escoList = i18n.getLocalization(escoListNLS);
      const publishToggleString = state.isPublish ? escaDataset.publishedTitle : escaDataset.unpublishedTitle;

      const catalogName = catalogEntry ? rdfutils.getLabel(catalogEntry) : null;
      const contributorsNames = contributors ? contributors.map(contributor => rdfutils.getLabel(contributor)) : null;

      return (
        <main class="overview__wrapper">
          <div class="flex--sb">
            <div class="metadata--wrapper">
              <div class="intro--wrapper">
                <h2 class="title">{ title }</h2>
                <p class="description">{ description }</p>
              </div>
              <div class="metadata--basic">
                { catalogName && <p><span class="metadata__label">{escaPublic.datasetBelongsToCatalog}</span> {catalogName}</p> }
                { themes.length &&
                  themes.map(theme => (
                    <p><span class="metadata__label">{escaDataset.themeTitle}:</span>
                       {theme}
                    </p>
                  ))
                }
                <p><span class="metadata__label">{escaDataset.lastUpdateLabel}:</span> {lastUpdatedDate.short}</p>
                {contributorsNames &&
                  contributorsNames.map( contributorName => (
                        <p><span class="metadata__label">{escaDataset.editedTitle}</span>{contributorName}</p>
                  ))
                }
                <Button class="btn--show" onclick={toggleMetadata}>{escaDataset.showMoreTitle}</Button>

              </div>
            </div>

            <div class="btn__wrapper">
              <Button class="btn--edit" onclick={actions.openEditDialog}>{escaDataset.editDatasetTitle}</Button>
              <Button>{escaDataset.downgrade}</Button>
              <Button>{escaDataset.removeDatasetTitle}</Button>
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
              <StatBox value="3" label={escoList.versionsLabel} link=""/>
              <StatBox value={comments.length} label={escaDataset.commentMenu} link=""/>
              <StatBox value="1" label={escaDataset.previewDatasetTitle} link=""/>
              <StatBox value="2" label={escaDataset.showideas} link=""/>
              <StatBox value="0" label={escaDataset.showresults} link=""/>
            </div>


          </div>


        </main>
      );
    },
  };
};
