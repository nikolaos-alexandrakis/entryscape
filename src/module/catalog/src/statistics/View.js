import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { getMultiDatasetChartData } from 'catalog/statistics/utils/chart';
import { isCatalogPublished } from 'catalog/utils/catalog';
import PlaceholderChart from 'commons/components/chart/Placeholder';
import BarChart from 'commons/components/common/chart/TimeChart';
import Pagination from 'commons/components/common/Pagination';
import SearchSelect from 'commons/components/common/select/SearchSelect';
import registry from 'commons/registry';
import statsAPI from 'commons/statistics/api';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { getAbbreviatedMimeType } from 'commons/util/mimeTypesUtil';
import { createSetState, LIST_PAGE_SIZE_SMALL } from 'commons/util/util';
import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import Placeholder from './components/Placeholder';
import SearchInput from './components/SearchInput';
import Spinner from './components/Spinner';
import Tabs from './components/Tabs';
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
      activeSearch: false,
      loadingData: true,
    };

    const setState = createSetState(state);

    const getListItems = async () => {
      const context = registry.getContext();
      try {
        const { selected } = state.timeRanges;
        let itemStats =
          await statsAPI.getTopStatistics(context.getId(), state.activeTab, timeRangeUtil.toAPIRequestPath(selected));

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
        console.log(err);
        return [];
      }
    };

    const getFirstItemFileName = (items) => {
      const itemURI = items[0] ? items[0].uri : '';
      const selectedItem = items.find(item => item.uri === itemURI);

      let filename = '';
      if (selectedItem) {
        if ('filename' in selectedItem && selectedItem.filename) {
          filename = selectedItem.filename;
        } else {
          filename = selectedItem.name;
        }
      }

      return [items, filename];
    };

    /**
     * @param items
     * @param filename
     * @param isLoadingData
     * @return {Object}
     */
    const updateStateOfList = ([items, filename], isLoadingData = false) => setState({
      list: {
        items,
        selected: {
          uri: items[0] ? items[0].uri : null,
          name: filename,
        },
      },
      loadingData: isLoadingData,
    });

    /**
     * @param newPage
     * @param list
     */
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

    const resetChart = async () => {
      const { list, timeRanges } = state;
      if (list.selected.uri && timeRanges.selected !== 'custom') {
        const selectedEntry = await registry.getEntryStoreUtil().getEntryByResourceURI(list.selected.uri);
        const context = registry.getContext();

        getMultiDatasetChartData([selectedEntry], context, timeRanges.selected, list.selected.name)
          .then(data => setState({ chart: { data } }));
      } else {
        setState({ chart: { data: [] } });
      }
    };

    /**
     * Get the list, transform as needed, paginate and show the data in chart
     */
    const getListItemsAndRender = () => {
      getListItems()
        .then(getFirstItemFileName)
        .then(updateStateOfList)
        .then(() => paginateList(0)) // @todo shorthand for this
        .then(resetChart);
    };

    const onchangeTab = (tab) => {
      if (state.activeTab === tab) {
        return;
      }

      setState({
        activeTab: tab,
        loadingData: true,
      });

      getListItemsAndRender();
    };

    const onclickTimeRange = (range) => {
      setState({
        timeRanges: {
          selected: range,
        },
        loadingData: true, // show spinner
      });

      getListItemsAndRender();
    };

    const onclickListItem = async (selected) => {
      const selectedEntry = await registry.getEntryStoreUtil().getEntryByResourceURI(selected.uri);
      const context = registry.getContext();

      setState({
        list: {
          selected,
        },
      }, true);

      getMultiDatasetChartData([selectedEntry], context, state.timeRanges.selected, selected.name)
        .then(data => setState({ chart: { data } }));
    };

    /**
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
        setState({ activeSearch: true }, true);
      } else {
        setState({ activeSearch: false }, true);
        // the search input was cleared
        paginateList(0);
      }
    };

    const escaStatisticsNLS = i18n.getLocalization(escaStatistics);
    let isCatalogPublic = null;
    return {
      oninit() {
        isCatalogPublished().then((isPublic) => {
          if (isPublic) {
            // update list item state
            getListItemsAndRender();
          }

          isCatalogPublic = isPublic;
          m.redraw();
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
        const shouldShowSearch = hasData || state.activeSearch;
        const paginationTotalCount = state.activeSearch ? state.list.filteredItems.length : state.list.items.length;
        return (
          <div>
            <div className="stats__title">
              <h3>{escaStatisticsNLS.statsViewHeader}</h3>
            </div>
            <section className="stats__wrapper">
              <div className="chooser__wrapper">
                <h4>{escaStatisticsNLS.statsViewTimeRange}</h4>
                <SearchSelect
                  options={timeRangesItems}
                  selectedOptions={[state.timeRanges.selected]}
                  onChange={onclickTimeRange}
                />
              </div>
              <div className="visualization__wrapper">
                <h4>{escaStatisticsNLS.statsViewDistributionStats}</h4>
                <div className="visualization__chart">
                  {hasData ?
                    <BarChart
                      data={state.chart.data}
                      name={state.list.selected.name}/> :
                    !state.loadingData ? <PlaceholderChart text={escaStatisticsNLS.statsChartPlaceholder}/> : null
                  }
                </div>
              </div>
              <div className="data__wrapper">

                <div className="distributions__wrapper">
                  <div className="distributionList__tabs">
                    <Tabs items={tabs} selected={state.activeTab} onchangeTab={onchangeTab}/>
                  </div>
                  <div className="distributionList">
                    {state.loadingData ? <Spinner/> : (<div>
                      {shouldShowSearch ? <SearchInput onchangeSearch={onchangeSearch}/> : null}
                      <ListComponent
                        items={state.list.items}
                        filteredItems={state.list.filteredItems}
                        selected={state.list.selected.uri}
                        onclick={onclickListItem}/></div>)
                    }
                  </div>
                </div>
                {hasData ? <Pagination
                  currentPage={state.list.page}
                  totalCount={paginationTotalCount}
                  pageSize={LIST_PAGE_SIZE_SMALL}
                  handleChangePage={paginateList}/> : null}
              </div>
            </section>
          </div>
        );
      },
    };
  },
});

