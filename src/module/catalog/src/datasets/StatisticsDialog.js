import { isAPIDistribution } from 'catalog/datasets/utils/distributionUtil';
import escaStatistics from 'catalog/nls/escaStatistics.nls';
import TimeRangeDropdown from 'catalog/statistics/components/TimeRangeDropdown';
import timeRangeUtil from 'catalog/statistics/utils/timeRange';
import { getRowstoreAPIUUID } from 'catalog/utils/rowstoreApi';
import Chart from 'commons/components/common/chart/TimeBarChart';
import TitleDialog from 'commons/dialog/TitleDialog';
import registry from 'commons/registry';
import statsAPI from 'commons/statistics/api';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { createSetState } from 'commons/util/util';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';

const getChartData = async (entries, context, timeRange) => {
  const chartData = { datasets: [] };
  const labels = [];
  const entryStatisticsPromises = entries.map((entry) => {
    const label = getEntryRenderName(entry);
    labels.push(label);
    const entryId = isAPIDistribution(entry) ? entry.getId() : getRowstoreAPIUUID(entry); // @todo @valentino check if this works with aliasses
    return statsAPI.getEntryStatistics(context.getId(), entryId, timeRangeUtil.toAPIRequestPath(timeRange));
  });

  await Promise.all(entryStatisticsPromises).then((allEntriesStatsData) => {
    allEntriesStatsData.forEach((statsData, idx) => {
      delete statsData.count;
      const data = timeRangeUtil.normalizeChartData(timeRange, statsData);
      const label = labels[idx];
      chartData.datasets.push({ data, label });
    });
  });

  return chartData;
};

let component = null;
const timeRangesItems = timeRangeUtil.getTimeRanges();

const state = {
  data: [],
  timeRangeSelected: 'this-month',
};

const setState = createSetState(state);

const getControllerComponent = (entries, elementId) => {
  if (component) {
    return component;
  }

  const onclickTimeRange = (range) => {
    setState({
      timeRangeSelected: range,
    });

    getChartData(entries, registry.getContext(), state.timeRangeSelected)
      .then(data => setState({ data }));
  };


  component = {
    elementId,
    oninit() {
      getChartData(entries, registry.getContext(), state.timeRangeSelected)
        .then(data => setState({ data }));
    },
    view() {
      const escaStatisticsNLS = i18n.getLocalization(escaStatistics);
      return <section>
        <div>
          <h4>Combined Statistics</h4>
          <p>Here you can see a combined view of different user actions through time</p>
        </div>
        <div className="chooser__wrapper">
          <h4>{escaStatisticsNLS.statsDialogTimeRange}</h4>
          <TimeRangeDropdown
            items={timeRangesItems}
            selected={state.timeRangeSelected}
            onclickTimeRange={onclickTimeRange}/>
        </div>
        <Chart data={state.data} elementId={this.elementId}/>
      </section>;
    },
  };

  return component;
};

export default declare([TitleDialog.ContentComponent], {
  nlsBundles: [{ escaStatistics }],
  nlsHeaderTitle: 'statsDialogTitle',
  nlsFooterButtonLabel: 'statsDialogFooter',
  postCreate() {
    this.inherited(arguments);
    this.dialog.footerButtonAction = () => {
      component = null;
    };

    this.elementId = `distribution-dialog-statistics-${Math.random().toString(36).substring(4)}`;
  },
  open(params) {
    this.dialog.show();
    const controllerComponent = getControllerComponent(params.entries, this.elementId);
    this.show(controllerComponent);
  },
});
