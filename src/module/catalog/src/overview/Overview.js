import escaOverview from 'catalog/nls/escaOverview.nls';
import Chart from 'catalog/statistics/components/BarChart';
import Overview from 'commons/overview/components/Overview';
import registry from 'commons/registry';
import statsAPI from 'commons/statistics/api';
import dateUtil from 'commons/util/dateUtil';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import m from 'mithril';


const getCatalogStatistics = async (timeRangeDay) => {
  const context = registry.getContext();
  const itemStats = await statsAPI.getTopStatistics(context.getId(), 'all', timeRangeDay);

  return itemStats;
};

export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: '<div class="catalogOverview escoList"></div>',
  nlsBundles: [{ escaOverview }],
  getEntityNameFromURI(entityURI) {
    const es = registry.get('entrystore');
    if (entityURI.indexOf(es.getBaseURI()) === 0) {
      return entityURI.substr(es.getResourceURI('entitytypes', '').length);
    }
    return entityURI;
  },
  show() {
    this.data = {};
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

    Promise.all([...queryPromises]).then(() => {
      const modificationDate = catalogEntry.getEntryInfo().getModificationDate();
      const creationDate = catalogEntry.getEntryInfo().getCreationDate();
      const modificationDateFormats = dateUtil.getMultipleDateFormats(modificationDate);
      const creationDateFormats = dateUtil.getMultipleDateFormats(creationDate);

      // basic info
      this.data.description = registry.get('localize')(rdfutils.getDescription(catalogEntry));
      this.data.title = registry.get('localize')(rdfutils.getLabel(catalogEntry));

      const b = this.NLSLocalized0;

      // box list
      this.data.bList = [];
      querySListMap.forEach((searchList, rdfType) => {
        this.data.bList.push({
          key: rdfType,
          label: b[`${rdfType}Label`] ? b[`${rdfType}Label`] : `${rdfType}Label`,
          value: searchList.getSize(),
          link: spa.getViewPath(`catalog__${rdfType}s`, viewParams),
        });
      });

      // stats list
      this.data.sList = [
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

      (async () => {
        const today = new Date();
        const statsPromises = [];
        for (let i = 0; i <= 7; i++) {
          const date = new Date();
          date.setDate(today.getDate() - i);

          const timeRange = {
            year: date.getFullYear(),
            month: date.getMonth() + 1, // month is zero indexed
            day: date.getDate(),
          };

          console.log(timeRange);

          statsPromises.push(getCatalogStatistics(timeRange));
          // const uris = stats.map(stat => stat.uri);
          // console.log(stats);
        }

        const wholeStats = await Promise.all(statsPromises);
        console.log(wholeStats);
      })();

      m.render(document.querySelector('.catalogOverview.escoList'),
        <div>
          <Overview data={this.data}/>
          <hr/>
          <Chart data={[]} elementId={'catalog-statistics-overview'}/>
        </div>,
      );
    });
  },
});
