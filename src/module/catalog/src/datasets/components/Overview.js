import m from 'mithril';
import StatBox from 'commons/overview/components/StatBox';
import './Overview.scss';

export default (vnode) => {
  const { entry } = vnode.attrs;
  const metadata = entry.getMetadata();
  const resourceURI = entry.getResourceURI();
  const entryInfo = entry.getEntryInfo();

  const entryMetaData = {
    modified: entryInfo.getModificationDate().toString(),
  };

  return {
    view: (vnode) => {
      const title = metadata.findFirstValue(resourceURI, 'dcterms:title');
      const description = metadata.findFirstValue(resourceURI, 'dcterms:description');

      return (
        <main class="overview__wrapper">
          <div class="flex--sb">
            <div class="">
              <h2 class="title">{ title }</h2>
              <p class="description">{ description }</p>
            </div>

            <div>
              <button class="btn--action">Edit</button>
              <div class="flex--sb">
                <span class="fa fa-globe"></span>
                <p>Published</p>
                <button class="fa fa-toggle-on fa-lg btn--publish"></button>
              </div>
              <div class="internalPublish flex--sb">
                <span class="fa fa-eye"></span>
                <p>Published</p>
                <button class="fa fa-toggle-on fa-lg fa-rotate-180 btn--publish"></button>
              </div>
            </div>
          </div>

          <div class="metadata--basic">
            <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
            <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
            <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
            <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
          </div>

          <div class="metadata--wrapper">
            <button class="btn--action">Show more metadata</button>
            <div class="metadata--more">
              <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="metadata__label">Belongs to catalog:</span> { entryMetaData.modified }</p>
              <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
            </div>
          </div>

          <div class="flex--sb">
            <div class="distributions">
              <div class="header flex--sb">
                <h2>Distributions</h2>
                <button class="btn--circle btn--action">+</button>
              </div>
              <div class="entryRow"></div>
            </div>
            <div class="cards--wrapper">
              <StatBox value="blah" label="Comments" link=""/>
              <StatBox value="blah" label="Ideas" link=""/>
              <StatBox value="blah" label="Showcases" link=""/>
            </div>


          </div>


        </main>
      );
    },
  };
};
