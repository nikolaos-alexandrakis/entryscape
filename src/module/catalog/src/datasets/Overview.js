import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import ViewMixin from 'commons/view/ViewMixin';
import m from 'mithril';
import OverviewComponent from 'catalog/datasets/components/Overview/';

export default declare([ViewMixin, _WidgetBase], {
  buildRendering() {
    this.domNode = this.srcNodeRef || htmlUtil.create('div');
    this.viewNode = htmlUtil.create('div', null, this.domNode);
  },

  show(params) {
    const { context, dataset } = params.params;
    const es = registry.get('entrystore');
    const contextObj = context ? es.getContextById(context) : registry.get('context');
    contextObj.getEntryById(dataset).then((entry) => {
      m.mount(this.domNode, { view: () => m(OverviewComponent, { entry }) });

      return true;
    });
  },
});

