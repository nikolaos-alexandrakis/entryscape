import template from './ListAndContentViewTemplate.html';
import List from '../bench/List';
import ContentViewTabs from 'commons/contentview/ContentViewTabs';
import Placeholder from 'commons/placeholder/Placeholder';
import htmlUtil from 'commons/util/htmlUtil';

import {NLSMixin} from 'esi18n';
import eswoListAndContentView from 'workbench/nls/eswoListAndContentView.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import aspect from 'dojo/aspect';
import './eswoListAndContentView.css';

const ContentPlaceholder = declare([Placeholder], {
  nlsBundles: [{eswoListAndContentView}],

  getText() {
    return this.NLSBundle0.noContentViewerMessage;
  },

  render() {
    if (this.list.benchTypeConf && this.list.benchTypeConf.faClass) {
      this.missingImageClass = this.list.benchTypeConf.faClass;
    }
    this.inherited(arguments);
  },
});

export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: template,
  bid: 'eswoListAndContentView',

  show() {
    this.list = new List({
      benchTypeConf: this.benchTypeConf,
      bench: this.bench,
      mode: this.mode,
      listAndContentViewer: this,
    }, htmlUtil.create('div', null, this.__list));
    this.list.show();
    this.dPlaceholder = new ContentPlaceholder({
      search: false,
      list: this.list,
    }, htmlUtil.create('div', null, this.__placeholder));
    this.dPlaceholder.render();
    aspect.after(this.list.getView(), 'updateListCount', () => {
      if (this.list.getView().entryList.getSize() > 0) {
        this.__placeholder.style.display = 'block'
      } else {
        this.__placeholder.style.display = 'none';
      }
      this.clearContentView();
    }, true);
    this.inherited('show', arguments);
  },
  clearContentView() {
    if (this.list.getView().getSize() > 0) {
      this.__placeholder.style.display = 'block';
    } else {
      this.__placeholder.style.display = 'none';
    }
    this.__contentEditor.style.display = 'none';
    if (this.contentViewer) {
      this.contentViewer.destroy();
    }
  },
  open(benchTypeConf, params) {
    this.clearContentView();
    this.__placeholder.style.display = 'none';
    this.__contentEditor.style.display = '';
    this.contentViewer = new ContentViewTabs({
      entityConf: benchTypeConf,
      entry: params.row.entry,
    }, htmlUtil.create('div', null, this.__contentEditor));
  },
});
