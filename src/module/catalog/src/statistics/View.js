import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { getRowstoreAPIUUID } from 'catalog/utils/rowstoreApi';
import BootstrapDropdown from 'commons/components/bootstrap/Dropdown';
import InlineList from 'commons/components/bootstrap/InlineList';
import registry from 'commons/registry';
import statsAPI from 'commons/statistics/api';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { createSetState } from 'commons/util/util';
import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import jquery from 'jquery';
import BarChart from './components/BarChart';
import SearchInput from './components/SearchInput';
import Spinner from './components/Spinner';
import './index.scss';
import getDatasetByDistributionRURI from './utils/distribution';
import getTabs from './utils/tabs';
import timeRangeUtil from './utils/timeRange';

export default declare(MithrilView, {
  mainComponent: () => {
    const state = {
      list: {
        items: [],
        selected: null,
        filteredItems: null,
      },
      chart: {
        data: {
          series: [{
            name: '',
            data: [{}],
          }],
        },
      },
      timeRanges: {
        selected: 'this-month',
        items: timeRangeUtil.getTimeRanges(),
        custom: null, // custom.start, custom.end
      },
      activeTab: 'file',
      loadingData: true,
    };

    const setState = createSetState(state);

    const getListItems = async () => {
      const context = registry.getContext();
      try {
        const { custom, selected } = state.timeRanges;

        let itemStats;
        if (state.timeRanges.selected === 'custom') {
          itemStats =
            await statsAPI.getTopStatisticsAggregate(context.getId(), state.activeTab, custom);
        } else {
          itemStats =
            await statsAPI.getTopStatistics(context.getId(), state.activeTab, timeRangeUtil.toAPIRequestPath(selected));
        }

        const [fileEntries, distributionEntries, datasetEntries] = await getDatasetByDistributionRURI(itemStats);
        return itemStats.map((item) => {
          const distEntry = distributionEntries.get(item.uri);
          item.format = distEntry.getMetadata().findFirstValue(distEntry.getResourceURI(), 'dcterms:format');
          item.name = getEntryRenderName(datasetEntries.get(item.uri));
          item.subname = getEntryRenderName(distributionEntries.get(item.uri));
          item.filename = fileEntries.has(item.uri) ? getEntryRenderName(fileEntries.get(item.uri)) : null;

          return item;
        });
      } catch (err) {
        // no statistics found
        return [];
      }
    };

    const resetChart = () => {
      if (state.list.selected && state.timeRanges.selected !== 'custom') {
        getChartData().then(data => setState({ chart: { data } }));
      } else {
        setState({ chart: { data: [] } });
      }
    };

    const resetSearchField = () => {
      // this is not done with jquery to avoid keeping a mithril state
      jquery('#stats-search-input').val('');
    };

    const getChartData = async () => {
      const { selected } = state.timeRanges;
      if (state.timeRanges.selected === 'custom') {
        return [];
      }

      const context = registry.getContext();
      const entry = await registry.getEntryStoreUtil().getEntryByResourceURI(state.list.selected);

      const entryId = state.activeTab === 'file' ? entry.getId() : getRowstoreAPIUUID(entry);
      const chartData =
        await statsAPI.getEntryStatistics(context.getId(), entryId, timeRangeUtil.toAPIRequestPath(selected));

      delete chartData.count; // keep only chart relevant data
      return {
        series: [
          {
            name: 'whatever',
            data: timeRangeUtil.normalizeChartData(selected, chartData),
          },
        ],
      };
    };

    const onclickTab = (e) => {
      setState({
        activeTab: e.currentTarget.dataset.tab,
      });

      // show spinner
      setState({
        loadingData: true,
      });

      getListItems()
        .then(items => setState({
          list: { items, selected: items[0] ? items[0].uri : null },
          loadingData: false,
        }))
        .then(() => {
          resetChart();
          resetSearchField();
        });
    };

    /**
     * Will be initialized on creation of component.
     * Can be called to show the start/end date pickers
     * @type {Function}
     */
    let showDatePickers;

    const onclickTimeRange = (e) => {
      if (e.currentTarget.dataset.range === 'custom') {
        showDatePickers();
      } else {
        setState({
          timeRanges: {
            items: timeRangeUtil.getTimeRanges(),
            selected: e.currentTarget.dataset.range,
          },
          loadingData: true, // show spinner
        });

        getListItems()
          .then(items => setState({
            list: { items, selected: state.list.selected },
            loadingData: false,
          }))
          .then(() => {
            resetChart();
            resetSearchField();
          });
      }

      resetChart();
      resetSearchField();
    };

    const onclickListItem = (e) => {
      setState({
        list: {
          items: state.list.items,
          selected: e.currentTarget.dataset.uri,
        },
      });

      getChartData()
        .then(data => setState({ chart: { data } }));
    };

    const onchangeSearch = (e) => {
      if (e.target.value) {
        const filterString = e.target.value;
        const filteredItems =
          state.list.items.filter(item => !!(item.name.includes(filterString) || (item.subname && item.subname.includes(filterString))));

        setState({
          list: {
            selected: state.list.selected,
            items: state.list.items,
            filteredItems,
          },
        });
      } else {
        setState({
          list: {
            selected: state.list.selected,
            items: state.list.items,
          },
        });
      }
    };

    const escaStatisticsNLS = i18n.getLocalization(escaStatistics);

    return {
      oninit() {
        // update list item state
        getListItems()
          .then(items => setState({
            list: { items, selected: items.length > 0 ? items[0].uri : null },
            loadingData: false,
          }))
          .then(() => {
            resetChart();
            resetSearchField();
          });
      },
      oncreate() {
        // create date pickers
        const startDatePicker = jquery('#custom-date-start').bootstrapMaterialDatePicker({
          weekStart: 0,
          time: false,
        });

        const endDatePicker = jquery('#custom-date-end').bootstrapMaterialDatePicker({
          weekStart: 0,
          time: false,
        });

        // @todo startDatePicker.bootstrapMaterialDatePicker('setMinDate', getTopStatisticsStartAndEnd)
        startDatePicker.bootstrapMaterialDatePicker('setMaxDate', new Date());
        startDatePicker.on('change', (evt, startDate) => {
          endDatePicker.bootstrapMaterialDatePicker('setMinDate', startDate);
          endDatePicker.bootstrapMaterialDatePicker('setMaxDate', new Date());
          endDatePicker.one('change', (ev, endDate) => {
            const timeRangeItems = timeRangeUtil.getTimeRanges({ startDate, endDate });

            // update the state but don't redraw yet
            setState({
              timeRanges: {
                items: timeRangeItems,
                selected: 'custom',
                custom: { start: startDate, end: endDate },
              },
              loadingData: true,
            });

            // get statistics for custom time range and
            getListItems()
              .then(items => setState({
                list: { items, selected: null }, // don't preselect for custom time range to avoid chartist draw
                loadingData: false,
              }))
              .then(() => {
                resetChart();
                resetSearchField();
              });
          });
          endDatePicker.bootstrapMaterialDatePicker('_fireCalendar');
          endDatePicker.bootstrapMaterialDatePicker('showHeaderTitle', escaStatisticsNLS.timeRangeDatePickerEndDate);
        });
        showDatePickers = async () => {
          startDatePicker.bootstrapMaterialDatePicker('_fireCalendar');
          startDatePicker.bootstrapMaterialDatePicker('showHeaderTitle', escaStatisticsNLS.timeRangeDatePickerStartDate);
        };
      },
      view() {
        const tabs = getTabs();
        const ListComponent = tabs.find(tab => tab.id === state.activeTab).component;
        return (
          <div>
            <div className="stats__title">
              <h3>{escaStatisticsNLS.statsViewHeader}</h3>
            </div>
            <section className="stats__wrapper">
              <div className="data__wrapper">
                <div className="chooser__wrapper">
                  <h4>{escaStatisticsNLS.statsViewTimeRange}</h4>
                  <BootstrapDropdown items={state.timeRanges.items} selected={state.timeRanges.selected}
                                     onclick={onclickTimeRange}/>
                </div>
                <div className="distributions__wrapper">
                  <div className="distributionList__tabs">
                    <InlineList items={tabs} selected={state.activeTab} onclick={onclickTab}/>
                  </div>
                  <div className="distributionList">
                    {state.loadingData ? <Spinner/> : (<div>
                      <SearchInput onchange={onchangeSearch} onkeyup={onchangeSearch}/>
                      <ListComponent items={state.list.items} filteredItems={state.list.filteredItems}
                                     selected={state.list.selected} onclick={onclickListItem}/></div>)
                    }

                  </div>
                </div>
              </div>
              <div className="visualization__wrapper">
                <h4>{escaStatisticsNLS.statsViewDistributionStats}</h4>
                <div className="visualization__chart">
                  <BarChart data={state.chart.data}/>
                </div>
              </div>
            </section>
          </div>
        );
      },
    };
  },
});

