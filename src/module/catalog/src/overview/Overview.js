import escaOverview from 'catalog/nls/escaOverview.nls';
import Chart from 'catalog/statistics/components/BarChartTime';
import Overview from 'commons/overview/components/Overview';
import registry from 'commons/registry';
import statsAPI from 'commons/statistics/api';
import dateUtil from 'commons/util/dateUtil';
import { createSetState } from 'commons/util/util';
import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import './escaOverview.scss';


const getCatalogStatistics = async (timeRangeDay) => {
  const context = registry.getContext();
  return statsAPI.getTopStatistics(context.getId(), 'all', timeRangeDay);
};

const sumTotalCountFromResult = results => results.reduce((totalCount, res) => totalCount + res.count, 0);

const getChartData = async () => {
  const chartData = { datasets: [] };
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
  const dataPoints = [];
  const label = 'Aggregate';
  const results = await Promise.all(timeRanges.map(getCatalogStatistics));
  results.forEach((result, idx) => {
    const totalCount = sumTotalCountFromResult(result) || 0;
    const timeRange = timeRanges[idx];
    dataPoints.push({
      x: new Date(timeRange.year, timeRange.month, timeRange.date),
      y: totalCount,
    });
  });
  chartData.datasets.push({ data: dataPoints, label });

  return chartData;
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
      chartData: {
        datasets: [],
      },
    };

    const setState = createSetState(state);

    return {
      oninit() {
        getOverviewData().then(data => setState({ data }));
        getChartData().then(chartData => setState({ chartData }));
      },
      view() {
        return <div class="esca__Overview__wrapper">
          <Overview data={state.data}/>
          <div class="charts__column">
            <h4>Aggregated stats from the last 7 days</h4>
            <div class="chart__wrapper">
              <Chart data={state.chartData} elementId={'catalog-statistics-overview'}/>
            </div>
            <div class="chart__wrapper">
              <Chart data={state.chartData} elementId={'catalog-statistics-overview'}/>
            </div>
          </div>   
        </div>;
      },
    };
  },
});
