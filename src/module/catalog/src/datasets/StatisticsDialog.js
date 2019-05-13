import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { getMultiDatasetChartData } from 'catalog/statistics/utils/chart';
import timeRangeUtil from 'catalog/statistics/utils/timeRange';
import Chart from 'commons/components/common/chart/TimeBarChart';
import SearchSelect from 'commons/components/common/select/SearchSelect';
import TitleDialog from 'commons/dialog/TitleDialog';
import registry from 'commons/registry';
import { createSetState } from 'commons/util/util';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';

const timeRangesItems = timeRangeUtil.getTimeRanges();

const getControllerComponent = (entries) => {
  const state = {
    data: [],
  };
  const setState = createSetState(state);
  const defaultTimeRange = 'this-month';

  const loadData = (timeRange) => {
    const range = typeof timeRange === 'string' ? timeRange : defaultTimeRange;
    const context = registry.getContext();

    getMultiDatasetChartData(entries, context, range).then(data => setState({ data }));
  };

  return {
    oninit: loadData,
    view() {
      const escaStatisticsNLS = i18n.getLocalization(escaStatistics);
      return <section>
        <div className="chooser__wrapper">
          <h4>{escaStatisticsNLS.statsDialogTimeRange}</h4>
          <SearchSelect
            options={timeRangesItems}
            selectedOptions={[defaultTimeRange]}
            onChange={loadData}
          />
        </div>
        <Chart data={state.data}/>
      </section>;
    },
  };
};

export default declare([TitleDialog.ContentComponent], {
  nlsBundles: [{ escaStatistics }],
  nlsHeaderTitle: 'statsDialogTitle',
  nlsFooterButtonLabel: 'statsDialogFooter',
  postCreate() {
    this.inherited(arguments);
    this.dialog.footerButtonAction = () => {
      this.hide();
    };
  },
  open(params) {
    this.dialog.show();
    const controllerComponent = getControllerComponent(params.entries);
    this.show(controllerComponent);
  },
});
