import declare from 'dojo/_base/declare';
import ExpandRow from 'commons/list/common/ExpandRow';
import handlebars from 'blocks/boot/handlebars';
import 'jquery';

export default declare([ExpandRow], {
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

  initExpandArea(node) {
    const conf = this.list.conf;
    handlebars.run(node, {
      htemplate: conf.templates.rowexpand || '',
      context: this.entry.getContext().getId(),
      entry: this.entry.getId(),
    }, null, this.entry);
  },
  action_expand() {
    this.inherited(arguments);
    this.rowNode.classList.toggle('expanded');
  },
});
