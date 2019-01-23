import m from 'mithril';

export default (vnode) => {
  return {
    view: (vnode) => {
      return (
        <main class="overview__wrapper">

          <h2 class="datasetOverview__title">Name of dataset</h2>
          <p class="datasetOverview__description">Some description probably a long one</p>

          <div class="datasetOverview__metadata--basic">
            <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
            <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
            <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
            <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
          </div>

          <div class="datasetOverview__metadata--wrapper">
            <button class="btn--big btn--blue">Show more metadata</button>
            <div class="datasetOverview__metadata--more">
              <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
              <p><span class="datasetOverview__metadata__label">Belongs to catalog:</span> Name of catalog</p>
            </div>
          </div>

          <div>
            <button class="btn--big btn--blue">Edit</button>
            <div>
              <span class="fa fa-globe"></span>
              <p>Published</p>
              <button class="toggle"></button>
            </div>
            <div class="datasetOverview__internalPublish">
              <span class="fa fa-eye"></span>
              <p>Published</p>
              <button class="toggle"></button>
            </div>
          </div>

          <div class="datasetOverview__distributions">
            <div class="distributions__header">
              <h2>Distributions</h2>
              <button class="btn--circle">+</button>
            </div>
            <div class="entryRow"></div>

          </div>

        </main>
      );
    },
  };
};
