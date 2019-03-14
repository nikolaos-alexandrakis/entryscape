import { getDatatsetByDistributionURI, getDistributionByFileResourceURI } from 'catalog/utils/dcatUtil';
import BootstrapDropdown from 'commons/components/bootstrap/Dropdown';
import InlineList from 'commons/components/bootstrap/InlineList';
import Pagination from 'commons/components/bootstrap/Pagination';
import registry from 'commons/registry';
import statsAPI from 'commons/statistics/api';
import { getEntryRenderName } from 'commons/util/entryUtil';
import { createSetState } from 'commons/util/util';
import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import jquery from 'jquery';
import APICallList from './components/APICallList';
import DistributionList from './components/DistributionList';
import './index.scss';

/**
 * @todo @valentino
 *  - localize
 *  - make map?
 * @return {string[]}
 */
const getLocalizedTimeRanges = (custom = null) => {
  let customName = 'Custom';
  if (custom) {
    if (custom.startDate.year() === custom.endDate.year()) { // time range in same year
      customName = `${custom.startDate.format('MMM DD')} - ${custom.endDate.format('MMM DD')}`;
    } else {
      customName = `${custom.startDate.format('MMM DD, YYYY')} - ${custom.endDate.format('MMM DD, YYYY')}`;
    }
  }
  return [
    {
      id: 'today',
      name: 'Today',
    },
    {
      id: 'yesterday',
      name: 'Yesterday',
    },
    {
      id: 'this-month',
      name: 'This month',
    },
    {
      id: 'last-month',
      name: 'Last month',
    },
    {
      id: 'this-year',
      name: 'This year',
    },
    {
      id: 'last-year',
      name: 'Last year',
    },
    { // denotes li.divider
      id: '-',
      name: '-',
    },
    {
      id: 'custom',
      name: customName,
    },
  ];
};

/**
 * @todo @valentino nls
 * @return {*[]}
 */
const getTabs = () => {
  return [
    {
      id: 'file',
      label: 'Files',
      icon: 'fa-file',
      component: {
        class: DistributionList,
      },
    },
    {
      id: 'api',
      label: 'API calls',
      icon: 'fa-repeat',
      component: {
        class: APICallList,
      },
    },
  ];
};

const timeRange2ApiStructure = (selected) => {
  let date = new Date();
  switch (selected) {
    case 'today':
      break;
    case 'yesterday':
      date.setDate(date.getDate() - 1);
      break;
    case 'this-month':
      return {
        year: date.getFullYear().toString(),
        month: date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString(),
      };
    case 'last-month':
      date.setMonth(date.getMonth() - 1);
      return {
        year: date.getFullYear().toString(),
        month: date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString(),
      };
    case 'this-year':
      return {
        year: date.getFullYear().toString(),
      };
    case 'last-year':
      date.setFullYear(date.getFullYear() - 1);
      return {
        year: date.getFullYear().toString(),
      };
    case 'custom':
      break;
    default:
  }
  return {
    year: date.getFullYear().toString(),
    month: date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString(),
    date: date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString(),
  };
};

/**
 *
 * @param distRURIs
 * @param context
 * @return {Promise<Map<string, store/Entry>[]>}
 */
const getDatasetByDistributionRURI = async (distRURIs, context) => {
  const fileORAPIRURIs = distRURIs.map(dist => dist.uri); // @todo valentino change name
  /**
   * Get the actual distribution entries from the file/api resource URI
   * @type {Map<string, store/Entry>}
   */
  const distributionEntries = await getDistributionByFileResourceURI(fileORAPIRURIs, context);

  /**
   * for each distribution entry get the resource URIs
   */
  const fileRURI2DistributionEntry = new Map(); // @todo @valentino better naming
  const distributions2Resources = new Map();
  for (const [ruri, entry] of distributionEntries) { // eslint-disable-line
    fileRURI2DistributionEntry.set(ruri, entry);
    distributions2Resources.set(entry.getResourceURI(), ruri);
  }
  const distributionRURIs = Array.from(distributions2Resources.keys());
  const datasetEntries = await getDatatsetByDistributionURI(distributionRURIs, context);
  const fileRURI2DatasetEntry = new Map();
  for (const [ruri, entry] of datasetEntries) { // eslint-disable-line
    const fileOrAPIRURI = distributions2Resources.get(ruri);
    fileRURI2DatasetEntry.set(fileOrAPIRURI, entry);
  }

  return [fileRURI2DistributionEntry, fileRURI2DatasetEntry];
};


export default declare(MithrilView, {
  mainComponent: () => {
    const state = {
      items: [],
      timeRanges: {
        selected: 'this-month',
        items: getLocalizedTimeRanges(),
        custom: null, // custom.start, custom.end
      },
      activeTab: 'file',
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
            await statsAPI.getTopStatistics(context.getId(), state.activeTab, timeRange2ApiStructure(selected));
        }

        const [distributionEntries, datasetEntries] = await getDatasetByDistributionRURI(itemStats);
        return itemStats.map((item) => {
          const distEntry = distributionEntries.get(item.uri);
          item.format = distEntry.getMetadata().findFirstValue(distEntry.getResourceURI(), 'dcterms:format');
          item.name = getEntryRenderName(datasetEntries.get(item.uri));
          item.subname = getEntryRenderName(distributionEntries.get(item.uri));

          return item;
        });
      } catch (err) {
        // no statistics found
        return [];
      }
    };

    const onclickTab = (e) => {
      setState({
        activeTab: e.currentTarget.dataset.tab,
      });

      getListItems().then(items => setState({ items }));
    };

    const onclickTimeRange = (e) => {
      if (e.currentTarget.dataset.range === 'custom') {
        fireCalendar();
      } else {
        setState({
          timeRanges: {
            items: getLocalizedTimeRanges(),
            selected: e.currentTarget.dataset.range,
          },
        });

        getListItems().then(items => setState({ items }));
      }
    };

    return {
      oninit(vnode) {
        getListItems().then(items => setState({ items }));
      },
      oncreate(vnode) {
        const startDatePicker = jquery('#custom-date-start').bootstrapMaterialDatePicker({
          weekStart: 0,
          time: false,
        });

        // @todo startDatePicker.bootstrapMaterialDatePicker('setMinDate', getTopStatisticsStartAndEnd)
        startDatePicker.bootstrapMaterialDatePicker('setMaxDate', new Date());
        startDatePicker.on('change', (evt, startDate) => {
          const endDatePicker = jquery('#custom-date-end').bootstrapMaterialDatePicker({
            weekStart: 0,
            time: false,
          });

          endDatePicker.bootstrapMaterialDatePicker('setMinDate', startDate);
          endDatePicker.bootstrapMaterialDatePicker('setMaxDate', new Date());
          endDatePicker.on('change', (ev, endDate) => {
            const timeRangeItems = getLocalizedTimeRanges({ startDate, endDate });

            // update the state but don't redraw yet
            setState({
              timeRanges: {
                items: timeRangeItems,
                selected: 'custom',
                custom: { start: startDate, end: endDate },
              },
            }, true);

            // get statistics for custom time range and redraw
            getListItems().then(items => setState({ items }));
          });
          endDatePicker.bootstrapMaterialDatePicker('_fireCalendar');
        });
        fireCalendar = () => startDatePicker.bootstrapMaterialDatePicker('_fireCalendar');
      },
      view(vnode) {
        const tabs = getTabs();
        const ListComponent = tabs.find(tab => tab.id === state.activeTab).component.class;
        return (
          <div className="">
            <div className="">
              <h3>Here you can find some <span>info about stats</span></h3>
            </div>
            <section className="stats__wrapper">
              <div className="data__wrapper">
                <div className="chooser__wrapper">
                  <h4>Time frame</h4>
                  <BootstrapDropdown items={state.timeRanges.items} selected={state.timeRanges.selected}
                                     onclick={onclickTimeRange}/>
                </div>
                <div className="distributions__wrapper">
                  <div className="distributionList__tabs">
                    <InlineList items={tabs} selected={state.activeTab} onclick={onclickTab}/>
                  </div>
                  <div className="distributionList">
                    <ListComponent items={state.items}/>
                  </div>
                </div>
                <nav>
                  <Pagination/>
                </nav>
              </div>
              <div className="visualization__wrapper">
                <h4>Catalog/Distribution statistics for <span>2018</span></h4>
                <div className="visualization__chart"></div>
              </div>
            </section>
          </div>
        );
      },
    };
  },
});

