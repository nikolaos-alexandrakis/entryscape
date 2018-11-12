import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import { NLSMixin } from 'esi18n';
import escaPublic from 'catalog/nls/escaPublic.nls';
import { Presenter } from 'rdforms';
import RDFormsPresentDialog from 'commons/rdforms/RDFormsPresentDialog';
import DistributionDialog from 'catalog/public/DistributionDialog';
import config from 'config';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import template from './DatasetTemplate.html';
import './dataset.css';

export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: template,
  inDialog: false,
  nlsBundles: [{ escaPublic }],

  postCreate() {
    this.inherited('postCreate', arguments);
    this.infoDialog = new RDFormsPresentDialog({ maxWidth: 800 }, this.infoDialog);
    this.distributionInfoDialog = new DistributionDialog({ maxWidth: 800 }, this.distributionInfoDialog);
    this.presenter = new Presenter({ compact: true }, this.presenter);
    if (!this.inDialog) {
      this.domNode.classList.add('mainView');

      this.details.appendChild(this.detailsBlock);
      this.sidebar.appendChild(this.distributionBlock);
      this.sidebar.appendChild(this.catalogBlock);
      this.sidebar.appendChild(this.resultBlock);
    }
  },
  show(params) {
    const store = registry.get('entrystore');
    const context = registry.get('context');
    const entryId = params.entry;
    if (context && entryId) {
      this.entryPromise = store.getEntry(store.getEntryURI(context.getId(), entryId));
      this.entryPromise.then(this.showDataset.bind(this));
    }
  },
  showEntry(entry) {
    this.entryPromise = new Promise((resolve) => {
      resolve(entry);
      this.showDataset(entry);
    });
  },

  localeChange() {
    if (this.entryPromise) {
      this.entryPromise.then(this.showDataset.bind(this));
    }
  },

  showDataset(entry) {
    // registry.get('itemstore', (itemstore) => {
    if (entry) {
      const path = registry.getSiteManager().getViewPath('catalog__datasets__preview',
        { dataset: entry.getId(), context: entry.getContext().getId() });
      this.directLink.href = path;
    }

    const itemstore = registry.get('itemstore');
    this.entry = entry;
    const rdfutils = registry.get('rdfutils');
    const datasetTemplate = itemstore.getItem(config.catalog.datasetTemplateId);
    this.presenter.show({
      resource: entry.getResourceURI(),
      graph: entry.getMetadata(),
      template: datasetTemplate,
    });

    this.fetchCatalog(entry).then((catalogEntry) => {
      this.catalog.innerHTML = rdfutils.getLabel(catalogEntry);
      this.dcatEntry = catalogEntry;
    });

    this.fetchDistributions(entry).then(this.showDistributions.bind(this));
    this.fetchResults(entry).then(this.showResults.bind(this));
    // });
  },

  fetchCatalog(datasetEntry) {
    /** @type {store/EntryStore} */
    const store = registry.get('entrystore');
    return store.newSolrQuery().rdfType('dcat:Catalog').limit(2)
      .context(datasetEntry.getContext())
      .getEntries(0)
      .then((entryArr) => {
        if (entryArr.length !== 1) {
          throw Error('Wrong number of entries.');
        }
        return entryArr[0];
      });
  },

  fetchDistributions(datasetEntry) {
    const storeutil = registry.get('entrystoreutil');
    const md = datasetEntry.getMetadata();
    const stmts = md.find(datasetEntry.getResourceURI(), 'dcat:distribution');
    return Promise.all(stmts.map(
      stmt => storeutil.getEntryByResourceURI(stmt.getValue()).then(entry => entry)));
  },

  fetchResults(datasetEntry) {
    const list = [];
    return registry.get('entrystore').newSolrQuery().rdfType('esterms:Result')
      .context(datasetEntry.getContext())
      .uriProperty('dcterms:source', datasetEntry.getResourceURI())
      .list()
      .forEach((result) => {
        list.push(result);
      })
      .then(() => list);
  },

  showDistributions(dists) {
    this.distributions.innerHTML = '';
    dists.forEach((distE) => {
      if (distE != null) {
        const md = distE.getMetadata();
        const subj = distE.getResourceURI();
        const title = md.findFirstValue(subj, 'http://purl.org/dc/terms/title');
        const desc = md.findFirstValue(subj, 'http://purl.org/dc/terms/description');
        const access = md.findFirstValue(subj, 'http://www.w3.org/ns/dcat#accessURL');
        const label = title || desc || access;
        const tr = htmlUtil.create('tr', null, this.distributions);
        tdLabel = htmlUtil.create('td', { innerHTML: label }, tr);
        tdButtons = htmlUtil.create('td', null, tr);
        divWrapper = htmlUtil.create('div', { class: 'min-height-row' }, tdButtons);
        infoWrapper = htmlUtil.create('span', { class: 'badge' }, divWrapper);
        icon = htmlUtil.create('span', { class: 'fa fa-info-circle' }, divWrapper);
        const f = (ev) => {
          ev.stopPropagation();
          this.distributionInfoDialog.set('title', label);

          this.distributionInfoDialog.open(distE);
        };
        tr.addEventListener('click', f.bind(this));
      }
    });
  },

  showResults(results) {
    if (results.length === 0) {
      this.resultBlock.style.display = 'none';
      return;
    }
    this.resultBlock.style.display = '';
    this.results.innerHTML = '';
    results.forEach((resultE) => {
      if (resultE != null) {
        const md = resultE.getMetadata();
        const subj = resultE.getResourceURI();
        const title = md.findFirstValue(subj, 'dcterms:title');
        const desc = md.findFirstValue(subj, 'dcterms:description');
        const access = md.findFirstValue(subj, 'foaf:page');
        const label = title || desc || access;
        const tr = htmlUtil.create('tr', null, this.results);
        htmlUtil.create('td', { innerHTML: label }, tr);
        const tdButtons = htmlUtil.create('td', null, tr);
        const infoButton = htmlUtil.create('button', { class: 'btn btn-sm btn-default' }, tdButtons);
        htmlUtil.create('span', { class: 'fa fa-info-circle' }, infoButton);
        const f = (ev) => {
          ev.stopPropagation();
          this.infoDialog.title = label;
          this.infoDialog.localeChange();
          const dataResultTemplate = registry.get('itemstore').getItem(config.catalog.datasetResultTemplateId);
          this.infoDialog.show(
            resultE.getResourceURI(), resultE.getMetadata(), dataResultTemplate);
        };

        infoButton.addEventListener('click', f.bind(this));
        tr.addEventListener('click', f.bind(this));
      }
    });
  },

  onCatalogClick(ev) {
    ev.stopPropagation();
    const catalogTemplate = registry.get('itemstore').getItem(config.catalog.catalogTemplateId);
    const rdfutils = registry.get('rdfutils');
    this.infoDialog.title = rdfutils.getLabel(this.dcatEntry);
    this.infoDialog.localeChange();
    this.infoDialog.show(
      this.dcatEntry.getResourceURI(),
      this.dcatEntry.getMetadata(),
      catalogTemplate);
  },
});
