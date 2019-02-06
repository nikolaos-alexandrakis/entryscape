import Chartist from 'chartist';
import 'chartist-plugin-legend';
import registry from 'commons/registry';
import PublicView from 'commons/view/PublicView';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import esreVisualization from 'registry/nls/esreVisualization.nls';
import './esreVisualization.css';
import template from './VisualizationTemplate.html';

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

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit, PublicView], {
  templateString: template,
  bid: 'esreVisualization',
  nlsBundles: [{ esreVisualization }],

  localeChange() {
    this.show();
  },

  show() {
    const es = registry.get('entrystore');

    const list = es.newSolrQuery()
      .rdfType('st:CatalogStatistics')
      .limit(30)
      .context(es.getContextById('catalogstatistics'))
      .list();
    list.getEntries()
      .then((arr) => {
        if (arr.length === 0) {
          this.renderNoData();
        } else {
          this.renderMainStatistics(arr[0]);
          this.renderPartitions(arr[0]);
          arr.reverse();
          this.renderOrganisations(arr);
          this.renderLastMonth(arr);
        }
      });
  },

  renderNoData() {
  },

  renderLastMonth(arr) {
    const data = arr.map((st, idx) => {
      const ruri = st.getResourceURI();
      const psiAmount = st.getMetadata().findFirstValue(ruri, 'st:psiDatasetCount');
      const otherAmount = st.getMetadata().findFirstValue(ruri, 'st:otherDatasetCount');
      return { x: idx, y: parseInt(psiAmount, 10) + parseInt(otherAmount, 10) };
    });

    Chartist.Line('.vis1', {
      series: [{
        name: 'ticks',
        data,
      }],
    }, {
      chartPadding: { top: 20, right: 25, left: 50 },
      axisY: {
        type: Chartist.AutoScaleAxis, scaleMinSpace: 20, onlyInteger: true,
      },
      axisX: {
        type: Chartist.AutoScaleAxis,
        scaleMinSpace: 150,
        onlyInteger: true,
        labelInterpolationFnc(value) {
          return i18n.getDate(
            new Date(new Date().getTime() - ((arr.length - value) * 24 * 60 * 60 * 1000)).getTime(),
            { datePattern: 'DD' },
          );
        },
      },
      // low: 0,
      showArea: true,
    });
  },
  renderMainStatistics(latest) {
    const md = latest.getMetadata();
    const s = latest.getResourceURI();
    const psiDCount = md.findFirstValue(s, 'st:psiDatasetCount');
    const otherDCount = md.findFirstValue(s, 'st:otherDatasetCount');
    this.__datasetCount.innerHTML = parseInt(psiDCount, 10) + parseInt(otherDCount, 10);
    const idx = extract({}, latest);
    this.__organizationCount.innerHTML = Object.keys(idx).length;
  },
  renderPartitions(latest) {
    const md = latest.getMetadata();
    const s = latest.getResourceURI();
    const psiPage = parseInt(md.findFirstValue(s, 'st:psiPage'), 10);
    const psiPageAndDcat = parseInt(md.findFirstValue(s, 'st:psiPageAndDcat'), 10);
    const psiDcat = parseInt(md.findFirstValue(s, 'st:psiDcat'), 10);
    const psiFailed = parseInt(md.findFirstValue(s, 'st:psiFailed'), 10);

    const data = {
      series: [psiPageAndDcat, psiPage, psiDcat, psiFailed],
    };

    const b = this.NLSLocalized0;
    const options = {
      plugins: [
        Chartist.plugins.legend({
          position: 'bottom',
          legendNames: [
            i18n.renderNLSTemplate(b.dcatAndPSILegend, psiPageAndDcat),
            i18n.renderNLSTemplate(b.onlyPSILegend, psiPage),
            i18n.renderNLSTemplate(b.onlyDcatLegend, psiDcat),
            i18n.renderNLSTemplate(b.neitherLegend, psiFailed)],
        }),
      ],
      // TODO: https://github.com/gionkunz/chartist-js/issues/903
      // this is the reason we have a fork of chartist.
      chartPadding: {
        top: 35, bottom: 35, right: 250, left: 50,
      },
      donut: true,
      donutWidth: 30,
      labelOffset: 30,
      labelInterpolationFnc(value) {
        return value;
      },
    };

    const responsiveOptions = [
      ['screen and (min-width: 768px) and (max-width: 1240px)', {
        chartPadding: {
          top: 35, bottom: 35, right: 150, left: 15,
        },
        labelOffset: 20,
        donutWidth: 20,
      }],
      ['screen and (max-width: 600px)', {
        chartPadding: {
          top: 35, bottom: 35, right: 150, left: 15,
        },
        labelOffset: 20,
        donutWidth: 20,
      }]];
    Chartist.Pie('.vis2', data, options, responsiveOptions);
  },
  renderOrganisations(organizations) {
    if (organizations.length < 3) {
      return;
    }
    const arr = organizations.slice(organizations.length - 3);
    const idx = {};
    arr.forEach(extract.bind(this, idx));

    const ctxt2label = {};
    registry.get('entrystore').newSolrQuery().literalProperty('storepr:merge', 'true')
      .tagLiteral('latest')
      .list()
      .forEach((e) => {
        ctxt2label[e.getContext().getId()] = e.getMetadata().findFirstValue(null, 'dcterms:title');
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
        const series = [
          orgs.map(o => (o.d.length > l ? o.d[l] : 0)).slice(0, max),
          orgs.map(o => (o.d.length > l - 1 ? o.d[l - 1] : 0)).slice(0, max),
          orgs.map(o => (o.d.length > l - 2 ? o.d[l - 2] : 0)).slice(0, max),
        ];

        Chartist.Bar('.vis3', {
          labels,
          series,
        }, {
          stackBars: true,
          seriesBarDistance: 10,
          reverseData: true,
          horizontalBars: true,
          chartPadding: { right: 30 },
          axisY: {
            offset: 200,
          },
          axisX: {
            type: Chartist.AutoScaleAxis,
            onlyInteger: true,
          },
        });
      });
  },
});
