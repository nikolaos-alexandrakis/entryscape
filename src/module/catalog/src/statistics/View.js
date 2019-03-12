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
import APICallList from './components/APICallList';
import DistributionList from './components/DistributionList';
import './index.scss';

/**
 * @todo @valentino localize
 * @return {string[]}
 */
const getLocalizedTimeRanges = () => {
  return [
    'Today',
    'Yesterday',
    'This month',
    'Last month',
    'More preset ranges',
    '-', // denotes li.divider
    'Custom',
  ];
};

/**
 * @todo @valentino nls
 * @return {*[]}
 */
const getTabs = () => {
  return [
    {
      label: 'Files',
      icon: 'fa-file',
      component: {
        class: DistributionList,
      },
    },
    {
      label: 'API calls',
      icon: 'fa-repeat',
      component: {
        class: APICallList,
      },
    },
  ];
};

const timeRangeIdx2ApiStructure = (idx) => {
  let date = new Date();
  switch (idx) {
    case 0: // today
      break;
    case 1: // yesterday
      date.setDate(date.getDate() - 1);
      break;
    case 2: // this month
      return {
        year: date.getFullYear().toString(),
        month: date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString(),
      };
    case 3: // last month
      date.setMonth(date.getMonth() - 1);
      return {
        year: date.getFullYear().toString(),
        month: date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString(),
      };
    default:
  }
  return {
    year: date.getFullYear().toString(),
    month: date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString(),
    day: date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString(),
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
      activeTimeRangeIdx: 0,
      activeTabIdx: 0,
      customTimeRange: {
        start: '',
        end: '',
      },
    };

    const setState = createSetState(state);

    const getListItems = async () => {
      const timeRangeFilter = timeRangeIdx2ApiStructure(state.activeTimeRangeIdx);
      const type = state.activeTabIdx === 0 ? 'file' : 'api';
      const context = registry.getContext();

      try {
        const itemStats = await statsAPI.getTopStatistics(context.getId(), type, timeRangeFilter);
        const [distributionEntries, datasetEntries] = await getDatasetByDistributionRURI(itemStats);
        const items = itemStats.map((item) => {
          const distEntry = distributionEntries.get(item.uri);
          item.format = distEntry.getMetadata().findFirstValue(distEntry.getResourceURI(), 'dcterms:format');
          item.name = getEntryRenderName(datasetEntries.get(item.uri));
          item.subname = getEntryRenderName(distributionEntries.get(item.uri));

          return item;
        });

        setState({ items });
      } catch (err) {
        // no statistics found
        setState({ items: [] });
      }
    };

    const onclickTab = (e) => {
      setState({
        activeTabIdx: parseInt(e.currentTarget.dataset.tab, 10),
      });

      getListItems();
    };

    const onclickTimeRange = (e) => {
      setState({
        activeTimeRangeIdx: parseInt(e.currentTarget.dataset.range, 10),
      });

      getListItems();
    };

    return {
      oninit() {
        getListItems();
      },
      view(vnode) {
        const timeRanges = getLocalizedTimeRanges();
        const tabs = getTabs();
        const ListComponent = tabs[state.activeTabIdx].component.class;
        return (
          <div className="">
            <div className="">
              <h3>Here you can find some <span>info about stats</span></h3>
            </div>
            <section className="stats__wrapper">
              <div className="data__wrapper">
                <div className="chooser__wrapper">
                  <h4>Time frame</h4>
                  <BootstrapDropdown items={timeRanges} selected={state.activeTimeRangeIdx} onclick={onclickTimeRange}/>
                </div>
                <div className="distributions__wrapper">
                  <div className="distributionList__tabs">
                    <InlineList items={tabs} selected={state.activeTabIdx} onclick={onclickTab}/>
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

