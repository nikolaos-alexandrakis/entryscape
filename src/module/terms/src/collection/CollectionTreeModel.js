import TreeModel from 'commons/tree/TreeModel';
import jquery from 'jquery';

export default class extends TreeModel {
  constructor(params) {
    super(params);
    this.checkedNodes = {};
    this.uncheckedNodes = {};
    this.collectionEntry = params.collectionEntry;
    const jsTreeConf = {
      core: {
        multiple: true,
        check_callback: true,
        themes: {
          name: 'proton',
          responsive: true,
        },
      },
      plugins: ['checkbox'],
      checkbox: {
        three_state: false,
        tie_selection: false,
        keep_selected_style: false,
      },
    };
    this.initJsTreeConf(jsTreeConf, params.domNode);
    jquery(params.domNode).on('uncheck_node.jstree', this.uncheckedNode.bind(this));
    jquery(params.domNode).on('check_node.jstree', this.checkedNode.bind(this));
  }

  uncheckedNode(e, data) {
    data.event.stopPropagation();
    const uri = this.getResourceURIFromNode(data.node);
    if (this.checkedNodes[uri]) {
      delete this.checkedNodes[uri];
    } else {
      this.uncheckedNodes[uri] = data.node;
    }
    this.checkChange();
  }

  checkedNode(e, data) {
    data.event.stopPropagation();
    const uri = this.getResourceURIFromNode(data.node);
    if (this.uncheckedNodes[uri]) {
      delete this.uncheckedNodes[uri];
    } else {
      this.checkedNodes[uri] = data.node;
    }
    this.checkChange();
  }

  createNode(entry) {
    const node = super.createNode(entry);
    let isChecked = false;
    if (this.collectionEntry) {
      const collection = entry.getMetadata()
        .find(entry.getResourceURI(), 'dcterms:partOf', this.collectionEntry.getResourceURI());
      isChecked = collection.length !== 0;
    }
    node.state = { checked: isChecked };// get from entry metadata -partof
    return node;
  }

  getResourceURIFromNode(node) {
    const id = typeof node === 'object' ? node.id : node;
    return id === '#' ? this.rootEntry.getResourceURI() : id;
  }
}
