import m from 'mithril';
import StatBox from 'commons/overview/components/StatBox';
import { createSetState } from 'commons/util/util';
import MoreMetadata from './MoreMetadata';
import './Overview.scss';

export default (vnode) => {
  const { entry } = vnode.attrs;
  const metadata = entry.getMetadata();
  const resourceURI = entry.getResourceURI();
  const entryInfo = entry.getEntryInfo();
  

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
    setState({isPublish: !state.isPublish });
  }
  const toggleInternalPublish = () =>{
    setState({isInternalPublish: !state.isInternalPublish });
  }
  return {
    view: () => {
      const title = metadata.findFirstValue(resourceURI, 'dcterms:title');
      const description = metadata.findFirstValue(resourceURI, 'dcterms:description');
      const publishClass = state.isPublish ? '' : 'fa-rotate-180';
      const internalPublishClass= state.isInternalPublish ? '' : 'fa-rotate-180';

      return (
        <main class="overview__wrapper">
          <div class="flex--sb">
            <div class="intro--wrapper">
              <h2 class="title">{ title }</h2>
              <p class="description">{ description }</p>
            </div>

            <div>
              <button class="btn--action btn--edit">Edit</button>
              <div class="flex--sb">
                <div class="icon--wrapper">
                  <span class="icons fa fa-globe"></span>
                  <p class="published">Published</p>
                </div>
                <button class={`fa fa-toggle-on fa-lg  btn--publish ${publishClass}`} onclick={togglePublish}></button>
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
            <button class="btn--action btn--show" onclick={toggleMetadata}>Show more metadata</button>
            <MoreMetadata isHidden={state.isHidden} metadata={entryInfo}></MoreMetadata>
          </div>

          <div class="flex--sb">
            <div class="distributions">
              <div class="header flex--sb">
                <h2 class="title">Distributions</h2>
                <button class="btn--circle btn--action btn--add">+</button>
              </div>
              <div tabindex="0" class="distribution__row flex--sb">
                <div class="distribution__format flex--sb">
                  <p class="distribution__title"> Downloadable file</p>
                  <p class="file__format">CSV <span class="file__format--long">Common Separated Values</span></p>
                </div>
                <div class="icon--wrapper">
                  <p class="distribution__date">Jan 17</p>
                  <button class="icons fa fa-external-link"></button>
                  <button class="icons fa fa-download"></button>
                  <button class="icons fa fa-cog"></button>
                </div>
              </div>
            </div>
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
