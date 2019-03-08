import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import './index.scss';


export default declare(MithrilView, {
  mainComponent: () => ({
    view(vnode) {
      return (
        <div className="">
          <div className="">
            <h3>Here you can find some <span>info about stats</span></h3>
          </div>
          <section className="stats__wrapper">
            <div className="data__wrapper">
              <div className="chooser__wrapper">
                <h4>Time frame</h4>
                <div class="chooser">I am a chooser component</div>
              </div>
              <div className="distributions__wrapper">
                <div class="distributionList__tabs">
                  <ul class="nav">
                    <li class="nav-item">
                      <a class="nav-link active" href="#"><span class="fa fa-file"></span>Files</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" href="#"><span class="fa fa-repeat"></span>Link</a>
                    </li>
                  </ul>
                </div>
                <div class="distributionList__header">
                  <p>Title</p>
                  <div class="flex">
                    <p>Format</p>
                    <p class="fa fa-download"></p>
                  </div>
                </div>
                <div class="distributionList"></div>
              </div>
              <div className="pagination__wrapper">
                <div className="pagination">Pagination</div>
              </div>

            </div>
            <div className="visualization__wrapper">
              <h4>Catalog/Distribution statistics for <span>2018</span></h4>
              <div class="visualization__chart"></div>
            </div>

          </section>
        </div>
      );
    },
  }),
});

