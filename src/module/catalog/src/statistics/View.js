import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { isCatalogPublished } from 'catalog/utils/catalog';
import { getRowstoreAPIUUID } from 'catalog/utils/rowstoreApi';
import Pagination from 'commons/components/common/Pagination';
import registry from 'commons/registry';
import statsAPI from 'commons/statistics/api';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { getAbbreviatedMimeType } from 'commons/util/mimeTypesUtil';
import { createSetState, LIST_PAGE_SIZE_SMALL } from 'commons/util/util';
import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import jquery from 'jquery';
import BarChart from './components/BarChart';
import Placeholder from './components/Placeholder';
import SearchInput from './components/SearchInput';
import Spinner from './components/Spinner';
import Tabs from './components/Tabs';
import TimeRangeDropdown from './components/TimeRangeDropdown';
import './index.scss';
import getDatasetByDistributionRURI from './utils/distribution';
import getTabs from './utils/tabs';
import timeRangeUtil from './utils/timeRange';

export default declare(MithrilView, {
  mainComponent: () => {
    const state = {
      list: {
        items: [],
        filteredItems: null,
        selected: {
          uri: '',
          name: '',
        },
        page: 0,
      },
      chart: {
        data: [{}],
      },
      timeRanges: {
        selected: 'this-month',
      },
      activeTab: 'file',
      loadingData: true,
    };

    const setState = createSetState(state);

    const getChartData = async () => {
      const { selected } = state.timeRanges;
      const context = registry.getContext();
      const entry = await registry.getEntryStoreUtil().getEntryByResourceURI(state.list.selected.uri); // @todo add catch

      const entryId = state.activeTab === 'file' ? entry.getId() : getRowstoreAPIUUID(entry);
      const chartData =
        await statsAPI.getEntryStatistics(context.getId(), entryId, timeRangeUtil.toAPIRequestPath(selected));

      delete chartData.count; // keep only chart relevant data
      return timeRangeUtil.normalizeChartData(selected, chartData);
    };

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

        // keep only resource for which we could find parent distribution/dataset/entries
        itemStats = itemStats.filter(item =>
          fileEntries.has(item.uri) && distributionEntries.has(item.uri) && datasetEntries.has(item.uri));

        return itemStats.map((item) => {
          const distEntry = distributionEntries.get(item.uri);
          item.format = distEntry.getMetadata().findFirstValue(distEntry.getResourceURI(), 'dcterms:format');
          item.abbrevFormat = getAbbreviatedMimeType(item.format.trim()); // some formats have trailing spaces
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

    const paginateList = (newPage, list = null) => {
      const itemIdxStart = newPage === 0 ? newPage : newPage * LIST_PAGE_SIZE_SMALL;
      const listToPaginate = list || state.list.items;
      const itemTotalCount = listToPaginate.length;
      const itemIdxEnd = Math.min(itemTotalCount,
        newPage === 0 ? LIST_PAGE_SIZE_SMALL : (newPage + 1) * LIST_PAGE_SIZE_SMALL);

      const filteredItems = listToPaginate.slice(itemIdxStart, itemIdxEnd);

      setState({
        list: {
          filteredItems,
          page: newPage,
        },
      });
    };

    const resetChart = () => {
      if (state.list.selected.uri && state.timeRanges.selected !== 'custom') {
        getChartData().then(data => setState({ chart: { data } }));
      } else {
        setState({ chart: { data: [] } });
      }
    };

    const getSearchFieldValue = () => jquery('#stats-search-input').val();
    const resetSearchField = () => {
      // this is done with jquery to avoid keeping a mithril state
      jquery('#stats-search-input').val('');
    };

    const onchangeTab = (tab) => {
      if (state.activeTab === tab) {
        return;
      }

      setState({
        activeTab: tab,
        loadingData: true,
      });

      getListItems()
        .then(items => setState({
          list: {
            items,
            selected: {
              uri: items[0] ? items[0].uri : null,
              name: '',
            },
          },
          loadingData: false,
        }))
        .then(() => {
          paginateList(0);
          resetChart();
          resetSearchField();
        });
    };

    const onclickTimeRange = (range) => {
      setState({
        timeRanges: {
          items: timeRangeUtil.getTimeRanges(),
          selected: range,
        },
        loadingData: true, // show spinner
      });

      getListItems()
        .then(items => setState({
          list: { items },
          loadingData: false,
        }))
        .then(() => {
          paginateList(0);
          resetChart();
          resetSearchField();
        });

      resetChart();
      resetSearchField();
    };

    const onclickListItem = (selected) => {
      setState({
        list: {
          selected,
        },
      });

      getChartData()
        .then(data => setState({ chart: { data } }));
    };

    /**
     * @todo refactor
     * @param {string} value
     */
    const onchangeSearch = (value) => {
      if (value) {
        const filterString = value.toLowerCase();
        const filteredItems =
          state.list.items.filter((item) => {
            let { name = '', subname = '', filename = '' } = item;
            name = name.toLowerCase();
            subname = subname.toLowerCase();
            filename = filename.toLowerCase();
            return !!(name.includes(filterString) || subname.includes(filterString) || filename.includes(filterString));
          });

        paginateList(0, filteredItems);
      } else {
        // the search input was cleared
        paginateList(0);
      }
    };


    const escaStatisticsNLS = i18n.getLocalization(escaStatistics);
    let isCatalogPublic = null;
    return {
      oninit() {
        isCatalogPublished().then((isPublic) => {
          isCatalogPublic = isPublic;
        });

        if (isCatalogPublic === false) {
          return;
        }
        // update list item state
        getListItems()
          .then(items => setState({
            list: {
              items,
              selected: {
                uri: items.length > 0 ? items[0].uri : null,
                name: '',
              },
            },
            loadingData: false,
          }))
          .then(() => {
            paginateList(0);
            resetChart();
            resetSearchField();
          });
      },
      view() {
        if (isCatalogPublic === false) {
          return <Placeholder label={escaStatisticsNLS.statsNotPublishedCatalog}/>;
        }

        const timeRangesItems = timeRangeUtil.getTimeRanges();
        const tabs = getTabs();
        const ListComponent = tabs.find(tab => tab.id === state.activeTab).component;
        const toRenderItems = state.list.filteredItems || state.list.items || [];
        const hasData = !!toRenderItems.length > 0;
        const shouldShowSearch = hasData || getSearchFieldValue();
        const paginationTotalCount = getSearchFieldValue() ? state.list.filteredItems.length : state.list.items.length;
        return (
          <div>
            <div className="stats__title">
              <h3>{escaStatisticsNLS.statsViewHeader}</h3>
            </div>
            <section className="stats__wrapper">
              <div className="data__wrapper">
                <div className="chooser__wrapper">
                  <h4>{escaStatisticsNLS.statsViewTimeRange}</h4>
                  <TimeRangeDropdown
                    items={timeRangesItems}
                    selected={state.timeRanges.selected}
                    onclickTimeRange={onclickTimeRange}/>
                </div>
                <div className="distributions__wrapper">
                  <div className="distributionList__tabs">
                    <Tabs items={tabs} selected={state.activeTab} onchangeTab={onchangeTab} />
                  </div>
                  <div className="distributionList">
                    {state.loadingData ? <Spinner/> : (<div>
                      {shouldShowSearch ? <SearchInput onchangeSearch={onchangeSearch} /> : null}
                      <ListComponent
                        items={state.list.items}
                        filteredItems={state.list.filteredItems}
                        selected={state.list.selected.uri}
                        onclick={onclickListItem}/></div>)
                    }
                  </div>
                </div>
                <Pagination
                  currentPage={state.list.page}
                  totalCount={paginationTotalCount}
                  pageSize={LIST_PAGE_SIZE_SMALL}
                  handleChangePage={paginateList}/>
              </div>
              <div className="visualization__wrapper">
                <h4>{escaStatisticsNLS.statsViewDistributionStats}</h4>
                <div className="visualization__chart">
                  <BarChart data={state.chart.data} name={state.list.selected.name}/>
                </div>
              </div>
            </section>
          </div>
        );
      },
    };
  },
});

