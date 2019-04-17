import ButtonComponent from 'commons/components/common/button/Button';
import GroupComponent from 'commons/components/common/Group';
import KeyValueListComponent from 'commons/components/common/keyvalue/KeyValueList';
import TitleComponent from 'commons/components/common/Title';
import registry from 'commons/registry';
import dateUtil from 'commons/util/dateUtil';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import { template } from 'lodash-es';
import m from 'mithril';
import { Graph } from 'rdfjson';
import esrePipelineResult from 'registry/nls/esrePipelineResult.nls';
import { terms } from 'store';
import './esrePipelineResult.css';
import { getStatusAndColor } from './util/pipelineResult';

export default declare([NLSMixin], {
  nlsBundles: [{ esrePipelineResult }],
  bid: 'esrePipelineResult',
  initialShow: true,
  validationProperties: [
    {
      nls: 'validationError',
      property: 'storepr:validateErrors',
    },
    {
      nls: 'validationWarning',
      property: 'storepr:validateWarnings',
    },
    {
      nls: 'validationDeprecated',
      property: 'storepr:validateDeprecated',
    },
  ],
  mergeProperties: [
    {
      nls: 'mergeAdded', // access this.NLSBundle0.mandatoryMissing
      property: 'storepr:mergeAdded',
    },
    {
      nls: 'mergeUpdated',
      property: 'storepr:mergeUpdated',
    },
    {
      nls: 'mergeRemoved',
      property: 'storepr:mergeRemoved',
    },
    {
      nls: 'mergeUnchanged',
      property: 'storepr:mergeUnchanged',
    },
  ],

  constructor(args) {
    const { entry, currentDialog = null } = args;
    this.entry = entry;
    this.currentDialog = currentDialog;

    this.initNLS();
  },
  getDate() {
    let modDate = this.entry.getEntryInfo().getCreationDate();
    try {
      modDate = dateUtil.getMultipleDateFormats(modDate).short;
    } catch (e) {
      console.log('Failed to format modification date');
      modDate = '';
    }

    return template(this.NLSBundle0.modifiedDateTitle)({ date: modDate });
  },
  getTitle() {
    switch (this.entry.getEntryInfo().getStatus()) {
      case terms.status.InProgress:
        return this.NLSLocalized0.jobRunning;
      case terms.status.Pending:
        return this.NLSLocalized0.jobPending;
      case terms.status.Failed:
        return this.NLSLocalized0.jobFailed;
      default: {
        const datasetCnt = parseInt(this.entry.getMetadata().findFirstValue(null, 'storepr:mergeResourceCount'), 10);
        if (typeof datasetCnt === 'number' && datasetCnt > 0) {
          return i18n.renderNLSTemplate(this.NLSLocalized0.titleDatasets, datasetCnt);
        }
        return this.NLSBundle0.noDatasets;
      }
    }
  },
  getBodyData() {
    const body = {
      data: {}, // check and fetch
      validationResults: {}, // validation
      mergeResults: {}, // merge
    };
    switch (this.entry.getEntryInfo().getStatus()) {
      case terms.status.InProgress:
      case terms.status.Pending:
        return this.NLSBundle0.noData;
      default: {
        const md = this.entry.getMetadata();

        // psi data page status
        const psidataPage = md.findFirstValue(null, 'storepr:check');
        body.data[this.NLSBundle0.psiDataPageStatus] = psidataPage ?
          this.NLSBundle0.foundText : this.NLSBundle0.notFoundText;

        // dcat source
        const dcatSource = md.findFirstValue(null, 'storepr:fetchSource') === 'true';
        body.data[this.NLSBundle0.dcatStatus] = dcatSource ?
          this.NLSBundle0.foundText : this.NLSBundle0.notFoundText;

        if (dcatSource) {
          const dcatRdf = md.findFirstValue(null, 'storepr:fetchRDF') === 'true';
          if (!dcatRdf) {
            const rdfError = md.findFirstValue(null, 'storepr:fetchRDFError');
            if (rdfError) {
              body.data[this.NLSBundle0.dcatStatus] = this.NLSBundle0.invalidRDFStatus;
              // TODO
              // domStyle.set(this.__rdfErrorRow, 'display', '');
              // domAttr.set(this.__rdfErrorMessage, 'innerHTML', rdfError);
            } else {
              body.data[this.NLSBundle0.dcatStatus] = this.NLSBundle0.formatStatus;
            }
            return body;
          }

          // add validation messages
          this.validationProperties.forEach((item) => {
            const nlsString = this.NLSBundle0[item.nls];
            body.validationResults[nlsString] =
              parseInt(md.findFirstValue(null, item.property) || 0, 10);
          });
          this.mergeProperties.forEach((item) => {
            const nlsString = this.NLSBundle0[item.nls];
            body.mergeResults[nlsString] =
              parseInt(md.findFirstValue(null, item.property) || 0, 10);
          });

          // if any validation failed then provide different data layout
          body.validationFailed = Object.keys(body.validationResults)
            .some(name => body.validationResults[name] > 0);
        } else {
          // dont display anything
          body.data[this.NLSBundle0.dcatStatus] = this.NLSBundle0.notFoundText;
        }

        return body;
      }
    }
  },
  getTitleComponent(title, hx = 'h4') {
    return m(TitleComponent, { title, hx });
  },
  getKeyValueComponent(data) {
    return m(KeyValueListComponent, { data });
  },
  getButtonComponent(info) {
    const { text, onclick } = info;
    return m(ButtonComponent, {
      text,
      onclick,
      classNames: ['float-right', 'btn-secondary'],
      inner: 'small',
    });
  },
  getBody(body) {
    if (typeof body !== 'string') {
      // TODO replace with some library, e.g _
      const isEmptyObject = obj => Object.keys(obj).length === 0 && obj.constructor === Object;

      const mergeComponents = (!isEmptyObject(body.mergeResults)) ? [
        this.getTitleComponent(this.NLSBundle0.mergeResult),
        this.getKeyValueComponent(body.mergeResults),
      ] : [];

      const validationComponents = (!isEmptyObject(body.validationResults)) ? [
        this.getTitleComponent(this.NLSBundle0.validationResult),
        this.getKeyValueComponent(body.validationResults),
      ] : [];

      const fileEntryURI = this.entry.getMetadata().findFirstValue(null, 'dcterms:source');
      if (fileEntryURI) {
        validationComponents.push(this.getButtonComponent({
          text: this.NLSBundle0.validationReport,
          onclick: this.validationReport.bind(this),
        }));
      }
      const components = [
        this.getTitleComponent(this.NLSBundle0.harvestingResult),
        this.getKeyValueComponent(body.data),
      ].concat(mergeComponents, validationComponents);

      return m(GroupComponent, { components });
    }
    return body;
  },
  getData() {
    const { bootstrap } = getStatusAndColor(this.entry);
    const renderTitle = this.getTitle();
    const date = (this.getDate() || '').toString();
    const body = this.getBody(this.getBodyData());

    return {
      id: this.entry.getId(),
      type: bootstrap,
      title: renderTitle,
      date,
      body,
    };
  },
  async validationReport() {
    const es = registry.get('entrystore');
    const fileEntryURI = this.entry.getMetadata().findFirstValue(null, 'dcterms:source');
    const e = await es.getEntry(fileEntryURI);
    const data = await e.getResource(true).getJSON();

    if (this.currentDialog) {
      this.currentDialog.hide();
    }
    registry.set('clipboardGraph', new Graph(data));
    registry.get('siteManager').render('toolkit__validator__report');
  },
});
