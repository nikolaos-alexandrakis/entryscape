import escaOverview from 'catalog/nls/escaOverview.nls';
import escaStatisticsNLS from 'catalog/nls/escaStatistics.nls';
import { isCatalogPublished, navigateToCatalogView } from 'catalog/utils/catalog';
import PlaceholderChart from 'commons/components/chart/Placeholder';
import DoughnutChart from 'commons/components/common/chart/Doughnut';
import Chart from 'commons/components/common/chart/TimeBarChart';
import Overview from 'commons/overview/components/Overview';
import OverviewHeader from 'commons/overview/components/OverviewHeader';
import registry from 'commons/registry';
import statsAPI from 'commons/statistics/api';
import dateUtil from 'commons/util/dateUtil';
import { createSetState } from 'commons/util/util';
import MithrilView from 'commons/view/MithrilView';
import config from 'config';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import './escaOverview.scss';

/**
 * Get top statistics for a specific time. Used here only with specific dates
 *
 * @param timeRangeDay
 * @return {Promise<*>}
 */
const getCatalogStatistics = async (timeRangeDay) => {
  const context = registry.getContext();
  return statsAPI.getTopStatistics(context.getId(), 'all', timeRangeDay);
};

/**
 * Sum downloads of api/file or both
 * @param results
 * @param {null|String} type
 * @return {*}
 */
const sumTotalCountFromResult = (results, type = null) => results.reduce((totalCount, res) => {
  if (type === null || type === res.type) {
    return totalCount + res.count;
  }

  return totalCount;
}, 0);

/**
 * Get statistics for catalog in the last 7 days
 *
 * @return {Promise<{bar: {datasets: Array}, doughnut: {datasets: {data: number[], label: *}[], labels: *[]}}>}
 */
const getStatisticsData = async () => {
  // prepare data structures and api calls
  const barData = { datasets: [] };
  const today = new Date();
  const timeRanges = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    timeRanges.push({
      year: date.getFullYear(),
      month: date.getMonth(), // month is zero indexed
      date: date.getDate(),
    });
  }

  // make api call and calculate results
  const escaStatistics = i18n.getLocalization(escaStatisticsNLS);
  const dataPointsFiles = [];
  const dataPointsAPI = [];
  let fileTotalCount = 0;
  let apiTotalCount = 0;
  const results = await Promise.all(timeRanges.map(getCatalogStatistics));
  results.forEach((result, idx) => {
    const fileCount = sumTotalCountFromResult(result, 'file');
    const apiCount = sumTotalCountFromResult(result, 'api');
    const timeRange = timeRanges[idx];
    dataPointsFiles.push({
      x: new Date(timeRange.year, timeRange.month, timeRange.date),
      y: fileCount,
    });
    dataPointsAPI.push({
      x: new Date(timeRange.year, timeRange.month, timeRange.date),
      y: apiCount,
    });

    fileTotalCount += fileCount;
    apiTotalCount += apiCount;
  });

  // populate the data structures for the charts
  barData.datasets.push({ data: dataPointsFiles, label: escaStatistics.statsCatalogOverviewChartFileLabel });
  barData.datasets.push({ data: dataPointsAPI, label: escaStatistics.statsCatalogOverviewChartAPILabel });

  const doughnutData = {
    labels: [escaStatistics.statsCatalogOverviewDoughnutFiles, escaStatistics.statsCatalogOverviewDoughnutAPI],
    datasets: [{
      label: escaStatistics.statsCatalogOverviewDoughnutLabel, // @todo perhaps not used
      data: [fileTotalCount, apiTotalCount],
    }],
  };

  return { bar: barData, doughnut: doughnutData };
};


const getOverviewData = async () => {
  const data = {};
  let catalogEntry;
  /** @type {store/EntryStore} */
  const es = registry.get('entrystore');
  const rdfutils = registry.get('rdfutils');
  const spa = registry.getSiteManager();
  const viewParams = spa.getUpcomingOrCurrentParams();
  const context = registry.get('context');

  const querySListMap = new Map();
  const queryPromises = [];

  queryPromises.push(context.getEntry().then((entry) => {
    catalogEntry = entry;
  }));

  const rdfTypesObject = {
    dataset: 'dcat:Dataset',
    candidate: 'esterms:CandidateDataset',
    showcase: 'esterms:Result',
    contact: ['vcard:Kind', 'vcard:Individual', 'vcard:Organization'],
    publisher: ['foaf:Agent', 'foaf:Person', 'foaf:Organization'],
    idea: 'esterms:Idea',
  };
  Object.keys(rdfTypesObject).forEach((rdfType) => {
    const searchList =
      es.newSolrQuery().context(context).rdfType(rdfTypesObject[rdfType]).list();

    querySListMap.set(rdfType, searchList);
    queryPromises.push(searchList.getEntries(0));
  });

  await Promise.all([...queryPromises]);
  const modificationDate = catalogEntry.getEntryInfo().getModificationDate();
  const creationDate = catalogEntry.getEntryInfo().getCreationDate();
  const modificationDateFormats = dateUtil.getMultipleDateFormats(modificationDate);
  const creationDateFormats = dateUtil.getMultipleDateFormats(creationDate);

  // basic info
  data.description = registry.get('localize')(rdfutils.getDescription(catalogEntry));
  data.title = registry.get('localize')(rdfutils.getLabel(catalogEntry));

  const b = i18n.getLocalization(escaOverview);


  // box list
  data.bList = [];
  querySListMap.forEach((searchList, rdfType) => {
    data.bList.push({
      key: rdfType,
      label: b[`${rdfType}Label`] ? b[`${rdfType}Label`] : `${rdfType}Label`,
      value: searchList.getSize(),
      link: spa.getViewPath(`catalog__${rdfType}s`, viewParams),
    });
  });

  // stats list
  data.sList = [
    {
      key: 'update',
      label: b.lastUpdatedLabel ? b.lastUpdatedLabel : 'lastUpdatedLabel',
      value: modificationDateFormats.short,
    },
    {
      key: 'create',
      label: b.createdLabel ? b.createdLabel : 'createdLabel',
      value: creationDateFormats.short,
    },
  ];

  return data;
};

export default declare(MithrilView, {
  mainComponent: () => {
    const state = {
      data: {
        title: '',
        description: '',
        sList: [],
        bList: [],
      },
      chart: {
        bar: [],
        doughnut: [],
      },
    };

    const setState = createSetState(state);
    const navigateToStatisticsView = () => navigateToCatalogView('catalog__statistics');

    let isCatalogPublic = false;
    return {
      oninit() {
        getOverviewData()
          .then(data => setState({ data })) // update state
          // if the catalog is public then get overview stats data
          .then(() => {
            isCatalogPublished().then((isPublic) => {
              isCatalogPublic = isPublic;
              if (isCatalogPublic) {
                getStatisticsData().then(({ bar, doughnut }) => setState({ chart: { bar, doughnut } }));
              }
            });
          });
      },
      view() {
        const showStats = config.get('catalog.includeStatistics', false) && isCatalogPublic;
        const hasChartData = state.chart.bar.length > 0;
        const escaStatistics = i18n.getLocalization(escaStatisticsNLS);


        return <div>
          <OverviewHeader title={state.data.title} description={state.data.description}/>
          <div class="esca__Overview__wrapper">
            <Overview data={state.data}/>
            {showStats ?
              (hasChartData ?
                <div class="charts__column">
                  <h4>{escaStatistics.statsCatalogOverviewTitle}</h4>
                  <div class="chart__wrapper">
                    <Chart data={state.chart.bar}/>
                  </div>
                  <div class="chart__wrapper">
                    <DoughnutChart data={state.chart.doughnut}/>
                  </div>
                  <button
                    class="btn btn-sm btn-secondary"
                    onclick={navigateToStatisticsView}>{escaStatistics.statsCatalogSeeAllBtn}
                  </button>
                </div> : <PlaceholderChart text={escaStatistics.statsChartPlaceholder}/>)
              : null}
          </div>
        </div>;
      },
    };
  },
});
