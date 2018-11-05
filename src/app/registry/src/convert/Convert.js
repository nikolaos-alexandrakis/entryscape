import registry from 'commons/registry';
import template from './ConvertTemplate.html';
import convert from './convertScript';
import htmlUtil from 'commons/util/htmlUtil';
import {i18n, NLSMixin} from 'esi18n';
import esreConvert from 'registry/nls/esreConvert.nls';
import esreSource from 'registry/nls/esreSource.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import './esreConvert.css';

const ns = registry.get('namespaces');
export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  bid: 'esreConvert',
  nlsBundles: [{esreConvert}, {esreSource}],
  templateString: template,

  __convert: null,
  __toBeConverted: null,

  postCreate() {
    this.inherited('postCreate', arguments);
  },

  checkConvert() {
    this.__table.innerHTML = '';

    const report = convert(this._graph, true);

    if (report.count === 0) {
      this.__convert.setAttribute('disabled', 'disabled');
    } else {
      this.__convert.removeAttribute('disabled');
    }

    const b = this.NLSLocalized.esreConvert;
    this.__toBeConverted.innerHTML = i18n.renderNLSTemplate(b.toBeConverted, report.count);
    Object.keys(report).forEach((prop) => {
      if (prop !== 'count') {
        if (report[prop].fixes && report[prop].fixes.length) {
          report[prop].fixes.forEach((fix) => {
            const tr = htmlUtil.create('tr', null, this.__table);
            htmlUtil.create('td', {
              innerHTML: ns.shorten(fix.s),
              title: fix.s,
            }, tr);
            const fixType = fix.t === 'p' ? b.predicateFix : b.objectFix;
            htmlUtil.create('td', {innerHTML: fixType}, tr);
            htmlUtil.create('td', {
              innerHTML: ns.shorten(fix.from),
              title: fix.from,
            }, tr);
            htmlUtil.create(
              'td',
              {innerHTML: ns.shorten(fix.to), title: fix.to},
              tr,
            );
          }, this);
        }
      }
    });
  },

  convert() {
    convert(this._graph);
    this.checkConvert();
  },

  show() {
    const graph = registry.get('clipboardGraph');
    if (graph == null || graph.isEmpty()) {
      const bundle = this.NLSBundles.esreSource;
      registry.get('dialogs').acknowledge(bundle.noRDF, bundle.noRDFProceed).then(() => {
        registry.get('siteManager').render('toolkit__rdf__source');
      });
      return;
    }
    this._graph = graph;
    this.checkConvert(graph);
  },
});
