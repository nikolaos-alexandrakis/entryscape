import GroupComponent from 'commons/components/common/Group';
import KeyValueListComponent from 'commons/components/common/keyvalue/KeyValueList';
import PanelGroupComponent from 'commons/components/common/panel/PanelGroup';
import TitleComponent from 'commons/components/common/Title';
import registry from 'commons/registry';
import config from 'config';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import m from 'mithril';
import { utils } from 'rdforms';
import esrePipelineResultListDialog from 'registry/nls/esrePipelineResultListDialog.nls';
import { terms, types } from 'store';
import PipelineResult from './PipelineResult';
import template from './PipelineResultsViewTemplate.html';

export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ esrePipelineResultListDialog }],
  jobEntries: [],
  latestJobEntry: null,
  bid: 'esrePipelineResultsView',
  inDialog: true,

  constructor(params) {
    if ('inDialog' in params) {
      this.inDialog = params.inDialog;
    }
    if (this.inDialog) {
      this.dialog = params.dialog;
    }
  },

  async show(params) {
    this.contextId = params.params.context;
    await this.loadJobEntries();
    this.renderViewLabel();
    await this.renderJobEntries();
    if (this.latestJobEntry) {
      // might be the case that no job entries exist yet
      this.isPSIOrg = this.latestJobEntry.getMetadata().find(
        null, 'dcterms:subject',
        { type: 'literal', value: 'psi' },
      ).length > 0;
    } else {
      this.isPSIOrg = (this.pipelineEntry.getMetadata()
        .findFirstValue(this.pipelineEntry.getResourceURI(), 'foaf:page') != null);
    }
    this.renderOrganizationInfo();
  },

  execute() {
    this.renderJobEntries(true); // just rerender to disabled the re-harvest button
    const es = registry.get('entrystore');
    this.pipelineEntry.getResource().then((pipeline) => {
      pipeline.execute().then((results) => {
        if (results.length === 1) {
          es.getEntry(results[0]).then((resultEntry) => {
            this.jobEntries.splice(0, 0, resultEntry);
            this.renderJobEntries();
          });
        }
      });
    });
  },

  getViewLabel(view, params, callback) {
    this.viewCallback = callback;
    this.renderViewLabel();
  },

  renderViewLabel() {
    if (this.viewCallback && this.latestJobEntry) {
      const rdfutils = registry.get('rdfutils');
      const name = rdfutils.getLabel(this.latestJobEntry) || '-';
      this.viewCallback(name, name);
      delete this.viewCallback;
    }
  },

  async renderOrganizationInfo() {
    const data = {};
    const pipelineResource = await this.pipelineEntry.getResource();
    if (this.isPSIOrg) {
      data[this.NLSBundle0.orgId] = this.pipelineEntry.getMetadata()
        .findFirstValue(null, 'dcterms:identifier') || this.NLSBundle0.notFound;
      data[this.NLSBundle0.psiPage] = pipelineResource.getTransformProperty('check', 'source')
        || this.NLSBundle0.notFound;
    }
    data[this.NLSBundle0.dcatAPI] = pipelineResource.getTransformProperty('fetch', 'source')
      || this.NLSBundle0.notFound;

    // userName
    const mdEntry = this.pipelineEntry.getMetadata();
    const ruri = this.pipelineEntry.getResourceURI();
    const title = mdEntry.findFirstValue(null, 'dcterms:title');
    const name = mdEntry.findFirstValue(null, 'foaf:mbox');
    const psiTag = mdEntry.find(
      ruri, 'dcterms:subject',
      { type: 'literal', value: 'psi' },
    ).length > 0;
    if (psiTag && name) {
      data[this.NLSBundle0.userId] = name.substr(7);
      // TODO
      // domStyle.set(this.__footer, 'display', 'block');
    }
    let button = {};

    // await for the contexts entry in order to get a boolean out of isPublic
    await this.pipelineEntry.getContext().getEntry();

    if (this.inDialog && this.pipelineEntry.isPublic()) {
      const text = this.NLSBundle0.openSeparateReportWindow;
      const popover = this.NLSBundle0.openSeparateReportWindowTitle;
      const icon = 'fa-external-link-alt';
      const sm = registry.getSiteManager();
      button = {
        element: 'a',
        text,
        href: sm.getViewPath('harvest__org', { context: this.contextId }),
        target: '_blank',
        externalLink: true,
        icon,
        popover,
        classNames: ['btn-secondary'],
      };
    }

    const contactText = config.registry && config.registry.contactText ?
      utils.getLocalizedValue(config.registry.contactText).value : undefined;

    // groups and renders renders a title with a key-value component
    this.__organizationInfo.style.display = '';
    m.render(this.__organizationInfo, [m(GroupComponent, {
      components: [
        m(TitleComponent, { title, hx: 'h3', button }),
        m(KeyValueListComponent, { data }),
      ],
    }),
    contactText ? m('div', { class: `alert alert-info ${this.bid}__info` }, [
      m('i', { class: `fas fa-info-circle fa-2x ${this.bid}__infoIcon` }),
      m('span', {}, contactText),
    ]) : null,
    ]);
  },

  async loadJobEntries() {
    this.jobEntries = [];
    const es = registry.get('entrystore');
    await es.newSolrQuery()
      .graphType(types.GT_PIPELINERESULT)
      .context(this.contextId)
      .sort('created+asc')
      .forEach((entry) => {
        this.jobEntries.push(entry);
      });
    [this.latestJobEntry] = this.jobEntries;
    await es.newSolrQuery()
      .tagLiteral('opendata')
      .context(this.contextId)
      .graphType(types.GT_PIPELINE)
      .list()
      .getEntries(0)
      .then((entries) => {
        if (entries.length > 0) {
          [this.pipelineEntry] = entries;
        }
      });
  },

  async renderJobEntries(onlyLockButton = false) {
    const readyJobEntriesPromises = this.jobEntries.map((entry) => {
      const args = this.dialog ? { entry, currentDialog: this.dialog } : { entry };
      const pr = new PipelineResult(args);
      return [pr];
    });

    const pipeResultsPromises = readyJobEntriesPromises.map(readyLocalesPromise => readyLocalesPromise[0]);
    const pipeResults = pipeResultsPromises.map(pipelineResult => pipelineResult.getData());

    const title = i18n.renderNLSTemplate(this.NLSLocalized0.harvestingLatestX, pipeResults.length);
    let button = {};
    if (this.pipelineEntry && this.pipelineEntry.canWriteResource()) {
      const text = this.NLSBundle0.pRcreateButtonLabel;
      const popover = this.NLSBundle0.pRcreatePopoverTitle;
      let onclick = this.execute.bind(this);
      let disabled = onlyLockButton;
      if (this.jobEntries.length > 0) {
        const status = this.jobEntries[0].getEntryInfo().getStatus();
        // disables the button if method is caleed with onlyLockButton = true or status is
        // Pending/Progress
        disabled = onlyLockButton || (status === terms.status.InProgress || status === terms.status.Pending);
        onclick = disabled ? undefined : onclick;
      }
      button = {
        text,
        popover,
        onclick,
        disabled,
        classNames: ['btn-raised', 'btn-success'],
      };
    }
    m.render(this.__pipelineResultList, m(PanelGroupComponent, {
      panels: pipeResults,
      title,
      button,
    }));
  },
});
