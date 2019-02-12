import registry from 'commons/registry';
import Placeholder from 'commons/placeholder/Placeholder';
import { Presenter } from 'rdforms';
import htmlUtil from 'commons/util/htmlUtil';
import { toggleDisplayNoneEmpty } from 'commons/util/cssUtil';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import config from 'config';
import DatasetSearch from './DatasetSearch';
import template from './SearchTemplate.html';
import './escaSearch.css';


export default declare([_WidgetBase, _TemplatedMixin], {
  bid: 'escaSearch',
  templateString: template,
  datasetSearchView: 'catalog__dataset__search',

  __catalogList: null,
  __main: null,
  __label: null,
  __catalogMetadata: null,
  __back: null,

  postCreate() {
    this.inherited(arguments);
    this.list = new DatasetSearch({}, htmlUtil.create('div', null, this.__main));
    this.list.render();
    this.placeholder = new Placeholder({}, htmlUtil.create('div', null, this.__placeholder));
    this.placeholder.show();
  },

  show() {
    this.inherited(arguments);
    const rdfutils = registry.get('rdfutils');
    const catalogs = [];
    let solrQuery = registry.get('entrystore').newSolrQuery().rdfType('dcat:Catalog');
    if (config.catalog && config.catalog.excludeEmptyCatalogsInSearch) {
      solrQuery = solrQuery.uriProperty('dcat:dataset', '*');
    }
    solrQuery.forEach((catalogEntry) => {
      catalogs.push({
        entry: catalogEntry,
        label: rdfutils.getLabel(catalogEntry),
        nr: catalogEntry.getMetadata().find(catalogEntry.getResourceURI(), 'dcat:dataset').length,
      });
    }).then(() => {
      catalogs.sort((c1, c2) => (c1.nr < c2.nr ? 1 : -1));
      this.render(catalogs);
    });
  },
  render(catalogs) {
    this.catalogs = catalogs;
    const context = registry.get('context');
    this.__catalogList.innerHTML = '';

    this.domNode.classList.toggle(`${this.bid}--catalogs`, catalogs.length !== 0);
    let catalog;
    if (catalogs.length === 1) {
      catalog = catalogs[0];
    } else if (context) {
      if (catalogs.length !== 0) {
        catalogs.some((c) => {
          if (c.entry.getContext() === context) {
            catalog = c;
            return true;
          }
          return false;
        });
      }
    }

    const site = registry.get('siteManager');
    const params = site.getUpcomingOrCurrentParams();
    const view = site.getUpcomingOrCurrentView();
    if (catalog) {
      this.catalogEntry = catalog.entry;
      this.domNode.classList.remove(`${this.bid}--list`);
      this.__label.innerHTML = catalog.label;
      this.showCatalogDetails();
      const p = Object.assign({}, params);
      delete p.context;
      if (catalogs.length <= 1) {
        this.domNode.classList.add(`${this.bid}--noListAvailable`);
      } else {
        this.domNode.classList.remove(`${this.bid}--noListAvailable`);
        this.__back.setAttribute('href', site.getViewPath(view, p));
      }
      // toggleDisplayNoneEmpty(this.__catalogControls);
      this.__catalogControls.style.display = ''; // TODO might not need a toggle but rather just setting of display
    } else {
      this.domNode.classList.add(`${this.bid}--list`);
      catalogs.forEach((catal) => {
        const p = Object.assign({}, params);
        p.context = catal.entry.getContext().getId();
        htmlUtil.create('a', {
          class: 'list-group-item list-group-item-action',
          href: site.getViewPath(this.datasetSearchView, p),
          innerHTML: `<span class='badge'>${catal.nr}</span>${catal.label}`,
        }, this.__catalogList);
      });
      toggleDisplayNoneEmpty(this.__catalogControls);
    }
    this.list.getView().action_refresh();
  },
  showCatalogDetails() {
    if (!this.catalogPresenter) {
      this.catalogPresenter = new Presenter({
        filterPredicates: { 'http://purl.org/dc/terms/title': true },
      }, htmlUtil.create('div', null, this.__catalogMetadata));
    }
    const catalogTemplate = registry.get('itemstore').getItem(config.catalog.catalogTemplateId);
    const resourceURI = this.catalogEntry.getResourceURI();
    const md = this.catalogEntry.getMetadata();
    this.catalogPresenter.show({ resource: resourceURI, graph: md, template: catalogTemplate });
  },
});
