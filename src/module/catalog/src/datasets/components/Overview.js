import m from 'mithril';
import DOMUtil from 'commons/util/htmlUtil';
import StatBox from 'commons/overview/components/StatBox';
import Toggle from 'commons/components/common/toggle/Toggle';
import { createSetState } from 'commons/util/util';
import EditDialog from 'catalog/datasets/DatasetEditDialog';
import DistributionList from './DistributionList';
import MoreMetadata from './MoreMetadata';
import './Overview.scss';

export default (vnode) => {
  const { entry } = vnode.attrs;
  const metadata = entry.getMetadata();
  const resourceURI = entry.getResourceURI();
  const entryInfo = entry.getEntryInfo();

  const editDialog = new EditDialog({ entry }, DOMUtil.create('div', null, vnode.dom));

  const state = {
    isHidden: true,
    isPublish: false,
    isInternalPublish: false,
  };

  const setState = createSetState(state);

  const toggleMetadata = () => {
    setState({ isHidden: !state.isHidden });
  };

  const togglePublish = () => {
    setState({ isPublish: !state.isPublish });
  };

  const toggleInternalPublish = () => {
    setState({ isInternalPublish: !state.isInternalPublish });
  };

  const openEditDialog = () => {
    editDialog.showEntry(entry);
  };

  return {
    view: () => {
      const title = metadata.findFirstValue(resourceURI, 'dcterms:title');
      const description = metadata.findFirstValue(resourceURI, 'dcterms:description');
      const internalPublishClass = state.isInternalPublish ? '' : 'fa-rotate-180';

      return (
        <main class="overview__wrapper">
          <div class="flex--sb">
            <div class="intro--wrapper">
              <h2 class="title">{ title }</h2>
              <p class="description">{ description }</p>
            </div>

            <div class="btn__wrapper">
              <button class="btn--action btn--edit" onclick={openEditDialog}>Edit</button>
              <button class="btn--action btn--show" onclick={toggleMetadata}>Show more metadata</button>
              <div class="flex--sb">
                <div class="icon--wrapper">
                  <span class="icons fa fa-globe"></span>
                  <p class="published">Published</p>
                </div>
                <Toggle isPublish={state.isPublish} onToggle={togglePublish}></Toggle>
              </div>
              <div class="internalPublish flex--sb">
                <div class="icon--wrapper">
                  <span class="icons fa fa-eye"></span>
                  <p class="unpublished">Unpublished</p>
                </div>
                <button class={`fa fa-toggle-on fa-lg  btn--publish ${internalPublishClass}`} onclick={toggleInternalPublish}></button>
              </div>
            </div>
          </div>

          <div class="metadata--basic">
            <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
            <p><span class="metadata__label">Theme:</span> Art</p>
            <p><span class="metadata__label">Last update:</span> 16:57</p>
            <p><span class="metadata__label">Edited by:</span> Althea Espejo, Valentino Hudra</p>
          </div>

          <div class="metadata--wrapper">
            <MoreMetadata isHidden={state.isHidden} metadata={entryInfo}></MoreMetadata>
          </div>

          <div class="flex--sb">
            <DistributionList entry={entry}></DistributionList>
            <div class="cards--wrapper">
              <StatBox value="3" label="Comments" link=""/>
              <StatBox value="2" label="Ideas" link=""/>
              <StatBox value="0" label="Showcases" link=""/>
            </div>


          </div>


        </main>
      );
    },
  };
};
