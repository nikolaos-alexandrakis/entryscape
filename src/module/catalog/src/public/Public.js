import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import Dataset from 'catalog/public/Dataset';
import 'commons/rdforms/linkBehaviour'; // needed ?
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';

export default declare([_WidgetBase], {
  buildRendering() {
    this.domNode = this.srcNodeRef || htmlUtil.create('div');
    this.viewNode = htmlUtil.create('div', null, this.domNode);
  },

  show(params) {
    const { context, dataset } = params.params;
    const es = registry.get('entrystore');
    const contextObj = context ? es.getContextById(context) : registry.get('context');

    if (dataset) {
      this.entryPromise = es.getEntry(es.getEntryURI(contextObj.getId(), dataset));
      this.entryPromise.then(this.showEntry.bind(this));
    }
  },

  showEntry(entry) {
    if (this.viewer) {
      this.viewer.destroy();
      delete this.viewer;
    }
    this.viewer = new Dataset({ inDialog: false }, htmlUtil.create('div', null, this.viewNode));
    this.viewer.startup();
    this.viewer.showEntry(entry);
  },
});
