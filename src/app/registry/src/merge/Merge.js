import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import PublicView from 'commons/view/PublicView';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import esreMerge from 'registry/nls/esreMerge.nls';
import esreSource from 'registry/nls/esreSource.nls';
import CatalogDetect from './CatalogDetect';
import './esreMerge.css';
import LoadDialog from './LoadDialog';
import merge from './mergeScript';
import template from './MergeTemplate.html';


export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit, PublicView], {
  bid: 'esreMerge',
  nlsBundles: [{ esreMerge }, { esreSource }],
  templateString: template,
  __mainCatalog: null,
  __mergeCatalogList: null,
  __mergeCatalogsIntoMain: null,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.mergeCatalogsList = [];
    this.loadDialog = new LoadDialog({ merge: this });
  },

  updateMainCatalog(rdf, source) {
    if (this.mainCatalog) {
      this.mainCatalog.remove();
      delete this.mainCatalog;
    }

    this.mainCatalog = new CatalogDetect(
      { isSlim: true, rdf, source },
      htmlUtil.create('div', null, this.__mainCatalog),
    );
    this.updateMerge();
  },

  addMergeCatalog() {
    if (registry.get('userInfo').id === '_guest') {
      const b = this.NLSLocalized.esreSource;
      registry.get('dialogs').acknowledge(b.signinRequirement, b.signinRequirementOk);
    } else {
      this.loadDialog.show(this.newMergeCatalog.bind(this));
    }
  },

  newMergeCatalog(rdf, source) {
    this.mergeCatalogsList.push(new CatalogDetect({
      mergeCheck: true,
      rdf,
      source,
      removeCallback: (cd) => {
        this.mergeCatalogsList.splice(this.mergeCatalogsList.indexOf(cd), 1);
        this.updateMerge();
      },
    }, htmlUtil.create('li', null, this.__mergeCatalogList)));
    this.updateMerge();
  },

  readyToMerge() {
    return this.mainCatalog && this.mainCatalog.error == null
      && (this.mergeCatalogsList || []).some(mc => mc.error == null);
  },

  updateMerge() {
    if (this.readyToMerge()) {
      this.__mergeCatalogsIntoMain.removeAttribute('disabled');
    } else {
      this.__mergeCatalogsIntoMain.setAttribute('disabled', 'disabled');
    }
  },
  mergeCatalogsIntoMain() {
    if (this.readyToMerge()) {
      const mrdflist = this.mergeCatalogsList.filter(cl => cl.error === null).map(cl => cl.rdf);
      merge(this.mainCatalog.rdf, mrdflist);
      this.updateMainCatalog(this.mainCatalog.rdf, 'Main catalog');
      this.clearMergeCatalogs();
    }
  },
  show() {
    const graph = registry.get('clipboardGraph');
    if (graph == null || graph.isEmpty()) {
      const bundle = this.NLSLocalized.esreSource;
      registry.get('dialogs').acknowledge(bundle.noRDF, bundle.noRDFProceed).then(() => {
        registry.get('siteManager').render('toolkit__rdf__source');
      });
      return;
    }

    this.updateMainCatalog(graph, 'Main catalog');
  },
  clearMergeCatalogs() {
    this.mergeCatalogsList.slice().forEach(cl => cl.destroy());

  },
});
