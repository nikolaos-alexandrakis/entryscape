import registry from 'commons/registry';
import typeIndex from 'commons/create/typeIndex';
import Placeholder from 'commons/placeholder/Placeholder';
import ViewMixin from 'commons/view/ViewMixin';
import htmlUtil from 'commons/util/htmlUtil';
import { NLSMixin } from 'esi18n';
import eswoBench from 'workbench/nls/eswoBench.nls';
import config from 'config';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import List from './List';
import ListAndContentView from './ListAndContentView';
import templateString from './BenchTemplate.html';
import entitytypes from '../utils/entitytypes';
import './eswoBench.scss';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit, ViewMixin], {
  bid: 'eswoBench',
  nlsBundles: [{ eswoBench }],
  templateString,
  viewName: 'workbench__entities',
  __sideList: null,
  __list: null,
  __placeholder: null,
  configuredEntitytypes: [],

  updateBadge(conf) {
    if (!this.name2badge) {
      return;
    }
    if (conf != null && this.name2badge[conf.name]) {
      const cid = registry.get('context').getId();
      this.name2badge[conf.name].innerHTML = typeIndex.get(cid, conf);
    }
  },
  postCreate() {
    this.inherited(arguments);
    const es = registry.get('entrystore');
    es.addAsyncListener((promise, callType) => {
      if (callType === 'createEntry') {
        promise.then((entry) => {
          const sm = registry.get('siteManager');
          const view = sm.getCurrentView();
          if (view === this.viewName) {
            typeIndex.add(entry);
            const conf = typeIndex.getConf(entry);
            this.updateBadge(conf);
          }
        });
      }
    });
  },
  getEntityNameFromURI(entityURI) {
    const es = registry.get('entrystore');
    if (entityURI.indexOf(es.getBaseURI()) === 0) {
      return entityURI.substr(es.getResourceURI('entitytypes', '').length);
    }
    return entityURI;
  },
  show(viewInfo) {
    const { params } = viewInfo;
    this.configuredEntitytypes = [];
    this.filteredConfEtypes = [];
    registry.get('context').getEntry().then((entry) => {
      const ei = entry.getEntryInfo();
      const graph = ei.getGraph();
      const entitytypeStmts = graph.find(null, 'esterms:entityType');
      if (entitytypeStmts && entitytypeStmts.length > 0) {
        if (entitytypeStmts.length === 1) {
          this.renderSingleEntity(this.getEntityNameFromURI(entitytypeStmts[0].getValue()));
          return;
        }
        entitytypeStmts.forEach((entitytype) => {
          this.configuredEntitytypes.push(this.getEntityNameFromURI(entitytype.getValue()));
        }, this);
      } else {
        config.entitytypes.forEach((configEntitytype) => {
          this.configuredEntitytypes.push(configEntitytype.name);
        }, this);
      }
      this.filteredConfEtypes = entitytypes.filterEntitytypes(this.configuredEntitytypes);
      this.configuredEntitytypes = entitytypes.sortNames(this.filteredConfEtypes);
      if (params.entity && this.configuredEntitytypes.indexOf(params.entity) !== -1) {
        this.render(params.entity);
      } else if (this.configuredEntitytypes && this.configuredEntitytypes.length > 0) {
        this.render(this.configuredEntitytypes[0]);
      } else {
        // TODO replace this with an akgnowledge dialog
        // eslint-disable-next-line no-alert
        alert('Config error, no types given for workbench.');
      }
    });
  },

  getViewLabel(view, params, callback) {
    const rdfutils = registry.get('rdfutils');
    let context = registry.get('context');
    if (context) {
      context = registry.get('context').getEntry().then((contextEntry) => {
        callback(rdfutils.getLabel(contextEntry));
      });
    } else {
      callback('???');
    }
  },

  destroyEditors() {
    if (this.list) {
      this.list.destroy();
      delete this.list;
    }
    if (this.listAndEditor) {
      this.listAndEditor.destroy();
      delete this.listAndEditor;
    }
  },

  renderSingleEntity(singleEntity) {
    this.__multipleEtypes.style.display = 'none';
    this.__singleEtype.style.display = 'block';
    this.__list.innerHTML = '';
    this.__singleEtypeList.innerHTML = '';
    this.destroyEditors();
    const contextEntry = registry.get('context').getEntry(true);
    const typeConf = typeIndex.getConfByName(singleEntity);
    this.createList(typeConf, contextEntry.canWriteResource(), this.__singleEtypeList);
  },

  createList(conf, isWrite, listNode) {
    this.__placeholder.style.display = 'none';
    this.__list.style.display = '';

    const newNode = htmlUtil.create('div', null, listNode);
    if (conf.split) {
      this.listAndEditor = new ListAndContentView({
        benchTypeConf: conf,
        bench: this,
        mode: isWrite ? 'edit' : 'present',
      }, newNode);
      this.listAndEditor.show();
    } else {
      this.list = new List({
        benchTypeConf: conf,
        bench: this,
        mode: isWrite ? 'edit' : 'present',
        includeMassOperations: !!((config.workbench && config.workbench.includeMassOperations)),
      }, newNode);
      this.list.show();
    }
  },

  render(selectedType) {
    const sm = registry.get('siteManager');
    const view = sm.getUpcomingOrCurrentView();
    const uparams = sm.getUpcomingOrCurrentParams();
    this.__multipleEtypes.style.display = 'block';
    this.__singleEtype.style.display = 'none';
    this.__list.innerHTML = '';
    this.__sideList.innerHTML = '';
    this.__list.style.display = 'none';
    this.__placeholder.style.display = '';

    this.destroyEditors();

    this.name2badge = {};
    const cid = registry.get('context').getId();
    const contextEntry = registry.get('context').getEntry(true);
    this.configuredEntitytypes.forEach((cEntitytype) => {
      const typeConf = typeIndex.getConfByName(cEntitytype);
      const params = uparams;
      params.entity = typeConf.name;
      const node = htmlUtil.create('li', {
        role: 'presentation',
        class: `${this.bid}__listItem`,
      }, this.__sideList);
      if (typeConf.name === selectedType) {
        this.createList(typeConf, contextEntry.canWriteResource(), this.__list);
        node.classList.add('active');
      }
      const a = htmlUtil.create('a', { href: sm.getViewPath(view, params) }, node);
      const title = registry.get('localize')(typeConf.label);
      const badge = htmlUtil.create('span', { class: 'badge pull-right' }, a);
      htmlUtil.create('span', {
        innerHTML: title,
        class: 'eswoBench__entityName',
      }, a);
      this.name2badge[typeConf.name] = badge;
      typeIndex.update(cid, typeConf, badge);
    });
  },
  localeChange() {
    if (!this.placeholder) {
      this.placeholder = new Placeholder({}, htmlUtil.create('div', null, this.__placeholder));
      this.placeholder.getText = () => this.NLSBundle0.selectEntitytypeMessage;
      this.placeholder.render();
    }
  },
});
