import registry from 'commons/registry';
import dateUtil from 'commons/util/dateUtil';
import entitytypes from 'workbench/utils/entitytypes';
import Overview from 'commons/overview/components/Overview';
import eswoOverview from 'workbench/nls/eswoOverview.nls';
import {NLSMixin} from 'esi18n';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import config from 'config';
import m from 'mithril';

export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: '<div class="workbenchOverview escoList"></div>',
  nlsBundles: [{eswoOverview}],
  getEntityNameFromURI(entityURI) {
    const es = registry.get('entrystore');
    if (entityURI.indexOf(es.getBaseURI()) === 0) {
      return entityURI.substr(es.getResourceURI('entitytypes', '').length);
    }
    return entityURI;
  },
  show() {
    this.data = {};
    let projectEntry;
    let configuredEntitytypes;
    const es = registry.get('entrystore');
    const rdfutils = registry.get('rdfutils');
    const spa = registry.get('siteManager');
    const currentOrUpcomingParams = spa.getUpcomingOrCurrentParams();
    const context = registry.get('context');

    const projectPromise = context.getEntry().then((entry) => {
      projectEntry = entry;
      const ei = entry.getEntryInfo();
      const graph = ei.getGraph();
      configuredEntitytypes = [];
      const entitytypeStmts = graph.find(null, 'esterms:entityType');
      if (entitytypeStmts && entitytypeStmts.length > 0) {
        entitytypeStmts.forEach((entitytype) => {
          configuredEntitytypes.push(this.getEntityNameFromURI(entitytype.getValue()));
        }, this);
      } else {
        config.entitytypes.forEach((configEntitytype) => {
          if (!configEntitytype.module || configEntitytype.module === 'workbench') {
            configuredEntitytypes.push(configEntitytype.name);
          }
        }, this);
      }
    });

    projectPromise.then(() => {
      const modificationDate = projectEntry.getEntryInfo().getModificationDate();
      const creationDate = projectEntry.getEntryInfo().getCreationDate();
      const modificationDateFormats = dateUtil.getMultipleDateFormats(modificationDate);
      const creationDateFormats = dateUtil.getMultipleDateFormats(creationDate);

      const isNLSBundleReady = this.nlsBundles[0] in this.NLSBundles;
      const b = this.NLSBundle0;

      // basic info
      this.data.description = registry.get('localize')(rdfutils.getDescription(projectEntry));
      this.data.title = registry.get('localize')(rdfutils.getLabel(projectEntry));

      // box list
      this.data.bList = [];
      this.data.bList.push({
        key: 'terms',
        label: b.configuredEntitiesLabel ? b.configuredEntitiesLabel : 'configuredEntitiesLabel',
        value: configuredEntitytypes.length,
        link: spa.getViewPath('workbench__entities', currentOrUpcomingParams),
      });
      // {
      //  key: 'collections',
      //  label: isNLSBundleReady ? localize(b, 'collectionLabel') : 'collectionLabel',
      //  value: collectionsList.getSize(),
      //  link: spa.getViewPath('workbenchcollections', currentOrUpcomingParams),
      // });

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

      m.render(document.querySelector('.workbenchOverview.escoList'), m(Overview, {data: this.data}));
    });
  },
});
