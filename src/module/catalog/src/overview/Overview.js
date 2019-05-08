import escaOverview from 'catalog/nls/escaOverview.nls';
import DoughnutChart from 'commons/components/common/chart/Doughnut';
import Chart from 'commons/components/common/chart/TimeBarChart';
import Overview from 'commons/overview/components/Overview';
import registry from 'commons/registry';
import statsAPI from 'commons/statistics/api';
import dateUtil from 'commons/util/dateUtil';
import { createSetState } from 'commons/util/util';
import MithrilView from 'commons/view/MithrilView';
import escaCatalogNLS from 'catalog/nls/escaCatalog.nls';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import './escaOverview.scss';


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


const getStatisticsData = async () => {
  // prepare data structures and api callls
  const barData = { datasets: [] };
  const doughnutData = { labels: ['Files', 'API'], datasets: [{ data: [] }] };
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
  const dataPoints = [];
  const label = 'Aggregate';
  let fileCount = 0;
  let apiCount = 0;
  const results = await Promise.all(timeRanges.map(getCatalogStatistics));
  results.forEach((result, idx) => {
    const totalCount = sumTotalCountFromResult(result) || 0;
    fileCount += sumTotalCountFromResult(result, 'file');
    apiCount += sumTotalCountFromResult(result, 'api');
    const timeRange = timeRanges[idx];
    dataPoints.push({
      x: new Date(timeRange.year, timeRange.month, timeRange.date),
      y: totalCount,
    });
  });

  // populate the data structures for the charts
  barData.datasets.push({ data: dataPoints, label });
  doughnutData.datasets[0].data.push(fileCount);
  doughnutData.datasets[0].data.push(apiCount);

  return [barData, doughnutData];
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

    return {
      oninit() {
        getOverviewData().then(data => setState({ data }));
        getStatisticsData().then(([bar, doughnut]) => setState({
          chart: {
            bar,
            doughnut,
          },
        }));
      },
      view() {
        const escaCatalog = i18n.getLocalization(escaCatalogNLS);

        return <div class="esca__Overview__wrapper">
          <Overview data={state.data}/>
          <div class="charts__column">
            <h4>{escaCatalog.catalogOverviewStatsTitle}</h4>
            <div class="chart__wrapper">
              <Chart data={state.chart.bar} elementId={'catalog-statistics-overview-bar'}/>
            </div>
            <div class="chart__wrapper">
              <DoughnutChart data={state.chart.doughnut} elementId={'catalog-statistics-overview-doughnut'}/>
            </div>
            <button onClick="" class="btn btn-raised btn-sm btn-primary">{escaCatalog.SeeAllBtn}</button>

          </div>
        </div>;
      },
    };
  },
});
