import { isAPIDistribution } from 'catalog/datasets/utils/distributionUtil';
import Chart from 'catalog/statistics/components/BarChart';
import TimeRangeDropdown from 'catalog/statistics/components/TimeRangeDropdown';
import timeRangeUtil from 'catalog/statistics/utils/timeRange';
import { getRowstoreAPIUUID } from 'catalog/utils/rowstoreApi';
import TitleDialog from 'commons/dialog/TitleDialog';
import registry from 'commons/registry';
import statsAPI from 'commons/statistics/api';
import { createSetState } from 'commons/util/util';
import declare from 'dojo/_base/declare';

const getChartData = async (entry, context, timeRange) => {
  const entryId = isAPIDistribution(entry) ? entry.getId() : getRowstoreAPIUUID(entry); // @todo @valentino check if this works with aliasses
  let data = await statsAPI.getEntryStatistics(context.getId(), entryId, timeRangeUtil.toAPIRequestPath(timeRange));
  delete data.count;
  data = timeRangeUtil.normalizeChartData(timeRange, data);
  return data;
};

let component = null;
const timeRangesItems = timeRangeUtil.getTimeRanges();

const state = {
  data: [],
  timeRanges: {
    selected: 'this-month',
  },
};

const setState = createSetState(state);

const getControllerComponent = (entry, elementId, name) => {
  if (component) {
    return component;
  }

  const onclickTimeRange = (range) => {
    setState({
      timeRanges: {
        selected: range,
      },
      loadingData: true, // show spinner
    });

    getChartData(entry, registry.getContext(), state.timeRanges.selected).then(data => setState({ data }));
  };


  component = {
    elementId,
    name,
    oninit() {
      getChartData(entry, registry.getContext()).then(data => setState({ data }));
    },
    view() {
      console.log(state.data);
      return <section>
        <div className="chooser__wrapper">
          <h4>Time Range</h4>
          <TimeRangeDropdown
            items={timeRangesItems}
            selected={state.timeRanges.selected}
            onclickTimeRange={onclickTimeRange}/>
        </div>
        <Chart data={state.data} elementId={this.elementId} name={this.name}/>
      </section>;
    },
  };

  return component;
};

export default declare([TitleDialog.ContentComponent], {
  postCreate() {
    this.dialog.footerButtonAction = () => {
      component = null;
    };
  },
  async open(params) {
    const elementId = 'distribution-dialog-statistics';
    const name = 'test';
    this.dialog.show();
    const controllerComponent = getControllerComponent(params.entry, elementId, name);
    this.show(controllerComponent);
  },
});
