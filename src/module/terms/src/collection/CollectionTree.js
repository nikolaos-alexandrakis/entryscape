import registry from 'commons/registry';
import Tree from 'commons/tree/Tree';
import htmlUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import CollectionTreeModel from './CollectionTreeModel';

const ns = registry.get('namespaces');

export default declare([Tree], {
  showEntry(entry, collectionEntry) {
    if (this.model) {
      import(/* webpackChunkName: "jstree" */ 'jstree').then(this.model.destroy);
    }
    if (!this.treeNode) {
      this.treeNode = htmlUtil.create('div', null, this.domNode);
    }
    this.model = new CollectionTreeModel({
      membershipToRootProperty: ns.expand('skos:inScheme'),
      fromRootProperty: ns.expand('skos:hasTopConcept'),
      toRootProperty: ns.expand('skos:topConceptOf'),
      toChildProperty: ns.expand('skos:narrower'),
      toParentProperty: ns.expand('skos:broader'),
      rootEntry: entry,
      domNode: this.treeNode,
      collectionEntry,
    });
  },
});
