define([
    "dojo/_base/declare",
    "rdforms/view/Presenter",
    "entryscape-commons/list/common/ExpandRow",
    "entryscape-blocks/boot/handlebars",
    "jquery"
], function (declare, Presenter, ExpandRow, handlebars, jquery) {

    return declare([ExpandRow], {
        showCol3: false,

        render() {
            var conf = this.list.conf;
            if (!conf.templates || !conf.templates.rowhead) {
                return this.inherited(arguments);
            }
            handlebars.run(this.nameNode, {
                htemplate: conf.templates.rowhead,
                context: this.entry.getContext().getId(),
                entry: this.entry.getId()
            }, null, this.entry);
        },

        initExpandArea: function(node) {
            var conf = this.list.conf;
            handlebars.run(node, {
                htemplate: conf.templates.rowexpand || "",
                context: this.entry.getContext().getId(),
                entry: this.entry.getId()
            }, null, this.entry);
        },
        action_expand: function() {
            this.inherited(arguments);
            this.rowNode.classList.toggle('expanded');
        }
    });
});