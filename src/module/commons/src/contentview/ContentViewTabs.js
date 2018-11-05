import templateString from './ContentViewTabsTemplate.html';
import DOMUtil from '../util/htmlUtil';
import registry from '../registry';
import config from 'config';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import './escoContentViewTabs.css';

export default declare([_WidgetBase, _TemplatedMixin, ListDialogMixin], {
  bid: 'escoContentViewTabs',
  templateString,
  entityConf: null, // Must be provided
  entry: null, // Must be provided
  initialTab: null,
  activeTab: null,

  postCreate() {
    this.inherited(arguments);
    this.tabs = {};
    if (this.entityConf.contentviewers.length === 1) {
      this.__tabList.style.display = 'none';
    }
    const contenttabs = this.entityConf.contentviewers.map(cv => (typeof cv === 'string' ? {name: cv} : cv));
    Promise.all(contenttabs.map(contentTab => this.createTab(contentTab)))
      .then(() => {
        if (this.initialTab) {
          this.switchTab(this.initialTab);
        } else {
          this.switchTab(contenttabs[0].name);
        }
      });
  },

  createTab(contentTabObj) {
    return new Promise((resolve) => {
      // contentTab object {name, param}
      const contentTab = contentTabObj.name;
      const cntViewConf = this.getContentViewConf(contentTab);
      if (!cntViewConf) {
        console.warn(`Contentviewer: ${contentTab} is missing in configuration`);
        resolve();
      }
      const li = DOMUtil.create('li', {role: 'presentation'}, this.__tabList);

      li.onclick = (ev) => {
        ev.stopPropagation();
        this.switchTab(contentTab);// pass tab name
      };

      const newAnchor = DOMUtil.create('a', {
        role: 'tab',
        'data-toggle': 'tab',
      }, li);

      newAnchor.innerHTML = registry.get('localize')(cntViewConf.label);
      newAnchor.classList.add(`${this.bid}__tab`);

      const view = new cntViewConf.class({
        tabs: this,
        // contentViewConf: lang.mixin({}, cntViewConf, contentTabObj), // TODO: @scazan this looks like an error (mixin takes 2 args only)
        contentViewConf: {...cntViewConf, ...contentTabObj},
        entityConf: this.entityConf,
        entry: this.entry,
      }, DOMUtil.create('div', null, this.__tabContent));
      view.domNode.classList.add('tab-pane');
      // domStyle.set(view.domNode, 'role', 'tabpanel'); // TODO: @scazan This looks like an error. Should be an attribute?
      view.domNode.setAttribute('role', 'tabpanel');

      this.tabs[contentTab] = {
        tabPanel: view.domNode,
        tabList: li,
      };
      resolve();
    });
  },
  getContentViewConf(contentTab) {
    let cntViewConf;
    config.contentviewers.forEach((contentViewer) => {
      if (contentViewer.name === contentTab) {
        cntViewConf = contentViewer;
      }
    });
    return cntViewConf;
  },
  switchTab(tabName) {
    Object.keys(this.tabs).forEach((tab) => {
      if (tab !== tabName) {
        this.tabs[tab].tabList.classList.remove('active');
        this.tabs[tab].tabPanel.classList.remove('active');
      }
    });
    this.activeTab = tabName;
    this.tabs[tabName].tabList.classList.add('active');
    this.tabs[tabName].tabPanel.classList.add('active');
  },
});
