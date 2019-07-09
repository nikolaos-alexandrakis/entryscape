import BarChart from 'commons/components/chart/Bar';
import DoughnutChart from 'commons/components/chart/Doughnut';
import TimeChart from 'commons/components/chart/Time';
import registry from 'commons/registry';
import { createSetState } from 'commons/util/util';
import MithrilView from 'commons/view/MithrilView';
import PublicView from 'commons/view/PublicView';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import esreVisualizationNLS from 'registry/nls/esreVisualization.nls';
import './style.css';

const namespaces = registry.get('namespaces');
namespaces.add('st', 'http://entrystore.org/terms/statistics#');

const extract = (idx, stat) => {
  const _idx = idx || {};
  const md = stat.getMetadata();
  const s = stat.getResourceURI();
  const base = 'http://entrystore.org/terms/statistics#datasets_in_context_';
  md.find(s).forEach((stmt) => {
    const p = stmt.getPredicate();
    if (p.indexOf(base) === 0) {
      const ctxt = p.substr(base.length);
      _idx[ctxt] = _idx[ctxt] || { d: [], t: 0 };
      const a = _idx[ctxt];
      const v = parseInt(stmt.getValue(), 10);
      if (a.d.length > 0) {
        a.d.push(v - a.t);
      } else {
        a.d.push(v);
      }
      a.t = v;
    }
  });
  return _idx;
};


/**
 *
 * @return {Promise<store/Entry|null>}
 */
const getCatalogStatisticsEntries = () => {
  const es = registry.getEntryStore();
  return es.newSolrQuery()
    .rdfType('st:CatalogStatistics')
    .limit(30)
    .context(es.getContextById('catalogstatistics'))
    .list()
    .getEntries();
};

const getLastMonthData = (entries) => {
  const today = new Date();
  return entries.map((entry, idx) => {
    const ruri = entry.getResourceURI();
    const psiAmount = entry.getMetadata().findFirstValue(ruri, 'st:psiDatasetCount');
    const otherAmount = entry.getMetadata().findFirstValue(ruri, 'st:otherDatasetCount');

    const date = new Date(today);
    date.setDate(today.getDate() - idx);

    return {
      x: date,
      y: parseInt(psiAmount, 10) + parseInt(otherAmount, 10),
    };
  });
};

const getMainStatistics = (entry) => {
  const md = entry.getMetadata();
  const s = entry.getResourceURI();
  const psiDCount = md.findFirstValue(s, 'st:psiDatasetCount');
  const otherDCount = md.findFirstValue(s, 'st:otherDatasetCount');
  const datasetCount = parseInt(psiDCount, 10) + parseInt(otherDCount, 10);
  const idx = extract({}, entry);
  const organizationCount = Object.keys(idx).length;

  return { datasetCount, organizationCount };
};

/**
 *
 * @param entry
 * @return {{datasets: {data: number[]}[], labels: *[]}}
 */
const getPartitions = (entry) => {
  const md = entry.getMetadata();
  const s = entry.getResourceURI();
  const psiPage = parseInt(md.findFirstValue(s, 'st:psiPage'), 10);
  const psiPageAndDcat = parseInt(md.findFirstValue(s, 'st:psiPageAndDcat'), 10);
  const psiDcat = parseInt(md.findFirstValue(s, 'st:psiDcat'), 10);
  const psiFailed = parseInt(md.findFirstValue(s, 'st:psiFailed'), 10);

  const esreVisualization = i18n.getLocalization(esreVisualizationNLS);
  const labels = [
    i18n.renderNLSTemplate(esreVisualization.dcatAndPSILegend, psiPageAndDcat),
    i18n.renderNLSTemplate(esreVisualization.onlyPSILegend, psiPage),
    i18n.renderNLSTemplate(esreVisualization.onlyDcatLegend, psiDcat),
    i18n.renderNLSTemplate(esreVisualization.neitherLegend, psiFailed)];


  return {
    labels,
    datasets: [{
      data: [psiPageAndDcat, psiPage, psiDcat, psiFailed],
    }],
  };
};

const getPublicOrganizations = (organizationsEntries) => {
  if (organizationsEntries.length < 3) {
    return Promise.resolve([]);
  }
  const arr = organizationsEntries.slice(organizationsEntries.length - 3);
  const idx = {};
  arr.forEach(extract.bind(this, idx));

  const ctxt2label = {};
  return registry.get('entrystore').newSolrQuery()
    .literalProperty('storepr:merge', 'true')
    .tagLiteral('latest')
    .list()
    .forEach((entry) => {
      ctxt2label[entry.getContext().getId()] = entry.getMetadata().findFirstValue(null, 'dcterms:title');
    })
    .then(() => {
      const orgs = [];
      Object.keys(idx).forEach((key) => {
        const l = ctxt2label[key];
        // If no label found, the organization has no datasets
        // in the latest index => ignore.
        if (l) {
          const { t } = idx[key];
          orgs.push({ l: `${l} (${t})`, t, d: idx[key].d });
        }
      });

      // eslint-disable-next-line no-nested-ternary
      orgs.sort((o1, o2) => (o1.t > o2.t ? -1 : ((o1.t < o2.t) ? 1 : 0)));

      const max = 20;
      const labels = orgs.map(o => o.l).slice(0, max);
      const l = orgs[0].d.length - 1;

      return {
        datasets: [{
          label: i18n.getLocalization(esreVisualizationNLS).datasetsPerOrg,
          data: orgs.map(o => (o.d.length > l ? o.d[l - 2] : 0)).slice(0, max),
        }],
        labels,
      };
    });
};

export default declare([MithrilView, PublicView], {
  mainComponent: () => {
    const state = {
      datasetCount: 0,
      organizationCount: 0,
      lastMonthData: [],
      publicOrganizations: [],
    };

    const setState = createSetState(state);

    return {
      oncreate() {
        getCatalogStatisticsEntries().then((entries) => {
          if (entries.length > 0) {
            const { datasetCount, organizationCount } = getMainStatistics(entries[0]);
            const partitions = getPartitions(entries[0]);
            const lastMonthData = {
              datasets: [{
                label: 'Number of datasets',
                data: getLastMonthData(entries),
              }],
            };

            setState({
              datasetCount,
              organizationCount,
              lastMonthData,
              partitions,
            });

            entries.reverse(); // earliest to latest
            getPublicOrganizations(entries).then((publicOrganizations) => {
              setState({
                publicOrganizations,
              });
            });
          }
        });
      },
      view() {
        const esreVisualization = i18n.getLocalization(esreVisualizationNLS);
        return (<div className="esreVisualization">
          <div className="row esreVisualization__container">
            <div className="esreVisualization__block">
              <h5 className="esreVisualization__centralHeading">{esreVisualization.datasetCount}</h5>
              <div className="esreVisualization__centralNumber">{state.datasetCount}</div>
            </div>
            <div className="esreVisualization__block">
              <h5 className="esreVisualization__centralHeading">{esreVisualization.organizationCount}</h5>
              <div className="esreVisualization__centralNumber">{state.organizationCount}</div>
            </div>
          </div>
          <div className="row justify-content-between">
            <div className="col">
              <h6 className="esreVisualization__header">{esreVisualization.datasetGrowth}</h6>
              <TimeChart data={state.lastMonthData} type="line" offset={false}/>
            </div>
            <div className="col">
              <h6 className="esreVisualization__header">{esreVisualization.orgStatus}</h6>
              <DoughnutChart data={state.partitions} type="pie"/>
            </div>
          </div>
          <div className="row">
            <div className="col justify-content-md-center" style="margin-bottom: 80px">
              <h6 className="esreVisualization__header">{esreVisualization.topOrganizations}</h6>
              <BarChart
                data={state.publicOrganizations}
                type="horizontalBar"
                options={{ scales: { yAxes: [{ barThickness: 6 }] } }}/>
            </div>
          </div>
        </div>);
      },
    };
  },
});
