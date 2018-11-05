import registry from '../registry';
import {Presenter} from 'rdforms';
import {NLSMixin} from 'esi18n';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import './escoImageView.css';
export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  includeMetadataPresentation: false,
  entry: null,
  entityConf: null,
  contentViewConf: null,
  tabs: null,

  postCreate() {
    this.inherited(arguments);
    if (this.includeMetadataPresentation) {
      this.renderMetadata();
    }
  },
  renderMetadata() {
    let template;
    if (this.tabs.list) {
      template = this.tabs.list.getTemplate();
    } else {
      template = registry.get('itemstore').getItem(this.entityConf.template);
    }
    const presenterDiv = document.createElement('div');
    this.__metadataViewer.appendChild(presenterDiv);
    const presenter = new Presenter({compact: true}, presenterDiv);
    const resource = this.entry.getResourceURI();
    const graph = this.entry.getMetadata();
    presenter.show({resource, graph, template});
  },
});
