define([
  'dojo/_base/declare',
  'rdforms/view/Presenter',
  'entryscape-blocks/boot/handlebars',
  'entryscape-commons/list/common/ExpandRow',
  'rdfjson/namespaces',
], (declare, Presenter, handlebars, ExpandRow, namespaces) => declare([ExpandRow], {
  showCol3: false,

  render() {
    const conf = this.list.conf;
    if (!conf.templates || !conf.templates.rowhead) {
      return this.inherited(arguments);
    }
    handlebars.run(this.nameNode, {
      htemplate: conf.templates.rowhead,
      context: this.entry.getContext().getId(),
      entry: this.entry.getId(),
    }, null, this.entry);
  },

  getRenderNameHTML() {
    const name = this.getRenderName();
    const href = this.list.getRowClickLink(this);
    return href ? `<a href="${href}">${name}</a>` : name;
  },

  initExpandArea(node) {
    const conf = this.list.conf;
    const fp = {};
    if (conf.filterpredicates) {
      conf.filterpredicates.split(',').forEach((p) => {
        fp[namespaces.expand(p)] = true;
      });
    }


    const newDiv = DOMUtil.create('div');
    newDiv.style.padding = '0px 0px 10px 15px';
    node.appendChild(newDiv);

    const p = new Presenter(
      { compact: conf.onecol !== true, filterPredicates: fp },
      newDiv,
    );
    const template = this.list.itemstore.getItem(conf.rdformsid || conf.template);
    p.show({ resource: this.entry.getResourceURI(),
      graph: this.entry.getMetadata(),
      template });
  },
}));
