import escaVisualization from 'catalog/nls/escaVisualization.nls';
import TitleDialog from 'commons/dialog/TitleDialog';
import declare from 'dojo/_base/declare';
import './CreateVisualizationDialog.scss';


const getControllerComponent = (datasetEntry) => {
  console.log(datasetEntry);
  return {
    view() {
      return <section class="viz__editDialog">
        <section class="viz__intro">
          <h4>Here you can choose the type of data visualization you want to use and in which axis is rendered</h4>
        </section>
        <section class="useFile__wrapper">
          <h5>You are using this file:</h5>
          <div class="dropdown">
            <button class="btn btn-default btn-sm dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              Name of distribution file
              <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
              <li><a href="#">Name of default file</a></li>
              <li><a href="#">Another distribution</a></li>
            </ul>
          </div>
        </section>
        <section class="graphType__wrapper">
          <h5>Choose a type of visualization</h5>
          <p>Consider that not all data work fine with all representations</p>
          <div class="graphType__card__wrapper">
            <div class="graphType__card">
              <p class="__title">Map</p>
            </div>
            <div class="graphType__card">
              <p class="__title">Pie Chart</p>
            </div>
            <div class="graphType__card">
              <p class="__title">Bar Chart</p>
            </div>
            <div class="graphType__card">
              <p class="__title">Line Chart</p>
            </div>
          </div>
        </section>
      </section>;
    },
  };
};
export default declare([TitleDialog.ContentComponent], {
  nlsBundles: [{ escaVisualization }],
  nlsHeaderTitle: 'vizDialogTitle',
  nlsFooterButtonLabel: 'vizDialogFooter',
  open(params) {
    const { entry: datasetEntry } = params;
    this.dialog.show();
    const controllerComponent = getControllerComponent(datasetEntry);
    this.show(controllerComponent);
  },
});
