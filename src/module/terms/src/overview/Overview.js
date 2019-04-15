import m from 'mithril';
import registry from 'commons/registry';
import Overview from 'commons/overview/components/Overview';
import ViewMixin from 'commons/view/ViewMixin';
import dateUtil from 'commons/util/dateUtil';
import { NLSMixin } from 'esi18n';
import esteOverviewNLS from 'terms/nls/esteOverview.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';

export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit, ViewMixin], {
  templateString: '<div class="termsOverview"></div>',
  nlsBundles: [{ esteOverviewNLS }],
  localeChange() {
    this.show();
  },
  show() {
    this.data = {};
    let concepts;
    let scheme;
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    const esu = registry.get('entrystoreutil');
    const rdfutils = registry.get('rdfutils');
    const ns = registry.get('namespaces');
    const context = registry.get('context');
    const spa = registry.getSiteManager();
    const currentOrUpcomingParams = spa.getUpcomingOrCurrentParams();
    const sl = es.newSolrQuery().rdfType(ns.expand('skos:Concept')).context(context)
      .sort('modified+desc')
      .limit(1)
      .list();
    const collectionsQuery = es.newSolrQuery().rdfType(ns.expand('skos:Collection'))
      .context(context).limit(0)
      .list();
    const collectionsQueryPromise = collectionsQuery.getEntries(0);

    const conceptsPromise = sl.getEntries(0).then((entries) => {
      concepts = entries;
    });

    const schemePromise = esu.getEntryByType('skos:ConceptScheme', context).then((skosEntry) => {
      scheme = skosEntry;
    });

    Promise.all([conceptsPromise, schemePromise, collectionsQueryPromise]).then(() => {
      const modificationDate = concepts.length > 0 ?
        concepts[0].getEntryInfo().getModificationDate() :
        scheme.getEntryInfo().getModificationDate();
      const creationDate = scheme.getEntryInfo().getCreationDate();
      const modificationDateFormats = dateUtil.getMultipleDateFormats(modificationDate);
      const creationDateFormats = dateUtil.getMultipleDateFormats(creationDate);

      const b = this.NLSLocalized0;

      // basic info
      this.data.description = rdfutils.getDescription(scheme);
      this.data.title = rdfutils.getLabel(scheme);

      // box list
      this.data.bList = [];
      this.data.bList.push(
        {
          key: 'terms',
          label: b.termsLabel ? b.termsLabel : 'termsLabel',
          value: sl.getSize(),
          link: spa.getViewPath('terminology__hierarchy', currentOrUpcomingParams),
        },
        {
          key: 'collections',
          label: b.collectionsLabel ? b.collectionsLabel : 'collectionsLabel',
          value: collectionsQuery.getSize(),
          link: spa.getViewPath('terminology__collections', currentOrUpcomingParams),
        });

      // stats list
      this.data.sList = [];
      this.data.sList.push(
        {
          key: 'update',
          label: b.lastUpdatedLabel ? b.lastUpdatedLabel : 'lastUpdatedLabel',
          value: modificationDateFormats.short,
        },
        {
          key: 'create',
          label: b.createdLabel ? b.createdLabel : 'createdLabel',
          value: creationDateFormats.short,
        });

      m.render(document.querySelector('.termsOverview'), m(Overview, { data: this.data }));
    });
  },
});
