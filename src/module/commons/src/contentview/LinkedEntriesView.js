import template from './LinkedEntriesViewTemplate.html';
import escoContentview from 'commons/nls/escoContentview.nls';
import DOMUtil from '../util/htmlUtil';
import {createEntry} from '../util/storeUtil';
import registry from '../registry';
import {Presenter, Editor} from 'rdforms';
import MetadataComponent from './MetadataComponent';
import ContentView from './ContentView';
import typeIndex from 'commons/create/typeIndex';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import './escoLinkedEntriesView.css';

export default declare([ContentView], {
  templateString: template,
  nlsBundles: [{escoContentview}],
  bid: 'escoContentview',
  entityConf: null,
  contentViewConf: null,

  postCreate() {
    if (!this.contentViewConf.linkedEntityType) {
      console.error(`No linkedEntitytype given in config for contentviewer "${this.contentViewConf.name}" on entitytype "${this.entityConf.name}"`);
      return;
    }
    this.splitConf = typeIndex.getConfByName(this.contentViewConf.linkedEntityType);

    this.template = registry.get('itemstore').getItem(this.splitConf.template);
    this.editor = new MetadataComponent({
      template: this.template,
      parentObj: this,
      presenterMode: false,
    }, DOMUtil.create('div', null, this.__editor));
    registry.get('context').getEntry().then((contextEntry) => {
      if (contextEntry.canWriteResource()) {
        this.__addNode.style.display = '';
      }
    });
    this.renderViewComponents();
    this.inherited(arguments);
  },
  renderViewComponents() {
    this.__viewComponentsList.innerHTML = '';
    const es = registry.get('entrystore');
    es.newSolrQuery()
      .uriProperty(this.contentViewConf.relation, this.entry.getResourceURI())
      .rdfType(this.splitConf.rdfType)
      .list()
      .getEntries(0)
      .then((entries) => {
        entries.forEach((entry) => {
          if (entry != null) {
            MetadataComponent({entry, parent: this, template: this.template},
              DOMUtil.create('div', null, this.__viewComponentsList));
          }
        });
        if (entries.length === 0) {
          this.add();
        }
      });
  },
  add() {
    this.__add.style.display = 'block';
    this.__addNode.style.display = 'none';
    this.newPEntry = createEntry();
    // Add constraints explicit in splitConf
    typeIndex.addConstraints(this.splitConf, this.newPEntry);
    // Add the relation back to the entry
    this.newPEntry.getMetadata().add(this.newPEntry.getResourceURI(),
      this.contentViewConf.relation, this.entry.getResourceURI());
    this.editor.show(this.newPEntry.getMetadata(), this.newPEntry.getResourceURI());
  },
  updateUI() {
    this.__add.style.display = 'none';
    this.__addNode.style.display = 'block';
  },
  save(graph) {
    this.newPEntry.setMetadata(graph).commit().then((entry) => {
      MetadataComponent({
        entry,
        parent: this,
        template: this.template,
      }, DOMUtil.create('div', null, this.__viewComponentsList, true));
      this.__add.style.display = 'none';
      this.__addNode.style.display = 'block';
    });
  },
});
