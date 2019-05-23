import DOMUtil from 'commons/util/htmlUtil';
import registry from 'commons/registry';
import jquery from 'jquery';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import TreeModel from './TreeModel';
import skosUtil from './skos/util';

export default declare([_WidgetBase], {
  constructor() {
    this.jsTreeConf = {
      plugins: ['dnd'],
      core: {
        multiple: false,
        check_callback: this.checkMove.bind(this),
        themes: {
          name: 'proton',
          responsive: true,
        },
      },
      dnd: {
        is_draggable(nodes) {
          return nodes[0].id !== '#';
        },
        check_while_dragging: false,
      },
    };
  },
  postCreate() {
    this.inherited('postCreate', arguments);
    this.domNode = this.srcNodeRef || DOMUtil.create('div');
  },
  show(params) {
    const context = registry.get('context');
    if (context && params.entry) {
      context.getEntryById(params.entry).then(this.showEntry);
    }
  },
  getTree() {
    return jquery(this.domNode).jstree(true);
  },
  getTreeModel() {
    return this.model;
  },
  getSelectedNode() {
    const nodeidArr = this.getTree().get_selected(true);
    if (nodeidArr.length > 0) {
      return nodeidArr[0];
    }

    return undefined;
  },
  getSelectedEntry() {
    const p = new Promise((resolve, reject) => {
      const node = this.getSelectedNode();
      if (node) {
        resolve(this.getTreeModel().getEntry(node));
      } else {
        reject('Could not find a selected entry');
      }
    });

    return p;
  },
  deleteNode() {
    const node = this.getSelectedNode();
    return this.getSelectedEntry()
      .then(entry => this.getTreeModel().deleteEntry(entry), e => console.log(e))
      .then(() => this.getTree().delete_node(node));
  },
  refresh(entry, deep) {
    const model = this.getTreeModel();
    const node = model.getNode(entry);
    if (deep === true) {
      this.getTreeModel().refresh(entry);
      this.getTree().refresh_node(node);
    } else {
      node.text = model.getText(entry);
      this.getTree().rename_node(node, node.text);
    }
  },
  showEntry(entry) {
    if (this.model) {
      this.model.destroy();
    }

    const treeConf = {
      jsTreeConf: this.jsTreeConf,
      rootEntry: entry,
      domNode: this.domNode,
    };

    const conf = Object.assign({}, skosUtil.getSemanticProperties(), treeConf);
    this.model = new TreeModel(conf);
  },
  checkMove(operation, node, nodeParent) {
    // allow anything apart from moving in the same partner, aka re-ordering
    if (operation === 'move_node' && node.parent === nodeParent.id) {
      this.disallowedSiblingMove();
      return false;
    }
    return true;
  },
  disallowedSiblingMove() {
    // Override
  },
});
