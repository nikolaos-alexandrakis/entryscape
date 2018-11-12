import htmlUtil from 'commons/util/htmlUtil';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import esreCatalogDetect from 'registry/nls/esreCatalogDetect.nls';
import template from './CatalogDetectTemplate.html';
import './esreCatalogDetect.css';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  bid: 'esreCatalogDetect',
  nlsBundles: [{ esreCatalogDetect }],
  templateString: template,
  mergeCheck: false,
  rdf: null,
  error: null,
  source: '',
  isSlim: false,

  __catalogStatus: null,
  __catalogSource: null,

  postCreate() {
    this.inherited(arguments);
    if (this.isSlim) {
      this.domNode.classList.add('esreCatalogDetect--slim');
    }
  },

  localeChange() {
    let ca = 0;
    let da = 0;
    let di = 0;
    let co = 0;
    let pu = 0;
    (this.rdf.find(null, 'rdf:type') || []).forEach((stmt) => {
      switch (stmt.getValue()) {
        case 'http://www.w3.org/ns/dcat#Catalog':
          ca += 1;
          break;
        case 'http://www.w3.org/ns/dcat#Dataset':
          da += 1;
          break;
        case 'http://www.w3.org/ns/dcat#Distribution':
          di += 1;
          break;
        case 'http://xmlns.com/foaf/0.1/Agent':
        case 'http://xmlns.com/foaf/0.1/Person':
        case 'http://xmlns.com/foaf/0.1/Organization':
          co += 1;
          break;
        case 'http://www.w3.org/2006/vcard/ns#Kind':
        case 'http://www.w3.org/2006/vcard/ns#Individual':
        case 'http://www.w3.org/2006/vcard/ns#Organization':
          pu += 1;
          break;
        default:
          break;
      }
    });
    let text;
    let hasError;
    const iconStatus = hasError ? { class: 'fa fa-exclamation-triangle' } : { class: 'fa fa-check-circle' };

    if (ca > 1) {
      hasError = true;
      text = i18n.renderNLSTemplate(this.NLSLocalized0.catalogError, ca);
      this.error = text;
    } else if (this.mergeCheck && da === 0 && di === 0 && co === 0 && pu === 0) {
      hasError = true;
      text = this.NLSLocalized0.nothingToMergeError;
      this.error = text;
    } else {
      hasError = false;
      text = i18n.renderNLSTemplate(this.NLSLocalized0.catalogStatus, {
        da, di, co, pu,
      });
    }
    htmlUtil.create('i', iconStatus, this.__catalogStatus);
    htmlUtil.create('p', { innerHTML: text }, this.__catalogStatus);

    this.__catalogSource.innerHTML = this.source;
  },
  remove() {
    if (this.removeCallback) {
      this.removeCallback(this);
    }
    this.destroy();
  },
});
