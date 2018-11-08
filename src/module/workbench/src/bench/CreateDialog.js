import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import CreateDialog from 'commons/list/common/CreateDialog';
import EntryType from 'commons/create/EntryType';

import declare from 'dojo/_base/declare';

export default declare([CreateDialog], {
  explicitNLS: true,
  postCreate() {
    const valueChange = val => (val != null ? this.unlockFooterButton() : this.lockFooterButton());

    // Add margin-left 1% somehow to be inline with rdforms.
    this.fileOrLink = new EntryType({
      valueChange,
    }, htmlUtil.create('div', null, this.containerNode, true));
    this.inherited(arguments);
  },

  open() {
    this.list.getView().clearSearch();
    const conf = this.list.benchTypeConf;
    // var conf = typeIndex.getConf();// check and get from list
    if (conf) {
      this.fileOrLink.showConfig(conf);
    } else {
      // What now?
    }
    // prototypeEntry need to be created before set acl properties, making unpublished
    this.inherited(arguments);
    if (conf.publishable && conf.publicFromStart !== true) {
      registry.get('getGroupWithHomeContext')(this._newEntry.getContext())
        .then((groupEntry) => {
          const ei = this._newEntry.getEntryInfo();
          const acl = ei.getACL(true);
          acl.admin.push(groupEntry.getId());
          ei.setACL(acl);
        });
    }
  },

  doneAction(graph) {
    this._newEntry.setMetadata(graph);
    return this.fileOrLink.newEntry(this._newEntry).then((newEntry) => {
      this.list.addRowForEntry(newEntry);
    });
  },
});
