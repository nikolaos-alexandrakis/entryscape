import m from 'mithril';
import { createSetState } from 'commons/util/util';
import Map from 'commons/rdforms/choosers/components/Map';
import BarChartTime from 'catalog/statistics/components/BarChartTime';
import './index.scss';
import TypeSelector from 'catalog/visualization/components/TypeSelector';
import VisualizationChart from 'catalog/visualization/components/VisualizationChart';
import AxisSelector from 'catalog/visualization/components/AxisSelector';

export default (vnode) => {
  const state = {
  };

  const setState = createSetState(state);

  return {
    view(vnode) {
      return (
        <div className='visualizations__sandbox'>
          <h3>Visualization Sandbox</h3>
          <div class="viz__wrapper">
          
            <section class="vizOptions__wrapper">
              <div class="datasets__wrapper">
                <h4>Datasets</h4>
                <p>Choose one or more datasets to visualize</p>
                <select class="form-control">
                  <option>Dataset 1</option>
                </select>
                <select class="form-control"><option>Dataset 2</option></select>
                <div class="btn__wrapper">
                  <button class="btn btn-sm btn-raised btn-primary">Combine</button>
                </div>
              </div>

              <div class="vizTypes__wrapper">
                <h4>Type of Visualization</h4>
                <TypeSelector
                  type={state.chartType}
                />
              </div>

              <div class="axesOperations__wrapper">
                <h4>Axes to use</h4>
                <p>Select a column per axis</p>
                <AxisSelector></AxisSelector>
              </div>
            </section>

            <section class="vizGraph__wrapper">
              <div>
                <VisualizationChart></VisualizationChart>
                <img src="https://static.vaadin.com/directory/user35550/screenshot/file8494337878231358249_15061520778722017-09-2309_33_26-VaadinChart.jsAddon.png"></img>
              </div>
            </section>

          </div>

          <Map
            value={[
              'POINT(30 10)',
              'POINT(31 10)',
            ]}
          />
          {/* <BarChartTime
            data={{
              series: [{
                name: '',
                data: [{}],
              }],
            }}
          />
          */}
        </div>
      );
    },
  };
};
