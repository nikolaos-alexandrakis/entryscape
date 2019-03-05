import m from 'mithril';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import EntryType from 'commons/create/EntryType';
import DOMUtil from 'commons/util/htmlUtil';
import stamp from 'dojo/date/stamp';
import RemoveDialog from 'commons/list/common/RemoveDialog';
import ReplaceDialog from 'workbench/bench/ReplaceDialog';

const ReplaceFileDialog = declare(ReplaceDialog, {
  footerButtonAction() {
    this.distributionEntry = this.list.entry;
    const distResourceURI = this.distributionEntry.getResourceURI();
    const distMetadata = this.distributionEntry.getMetadata();
    const inp = this.fileOrLink.getFileInputElement();
    const md = this.entry.getMetadata();
    md.findAndRemove(null, 'dcterms:title');
    md.addL(this.entry.getResourceURI(), 'dcterms:title', this.fileOrLink.getValue());
    return this.entry.commitMetadata().then(() => this.entry.getResource(true).putFile(inp).then(() => {
      distMetadata.findAndRemove(distResourceURI, 'dcterms:modified');
      distMetadata.addD(distResourceURI, 'dcterms:modified', stamp.toISOString(new Date()), 'xsd:date');
      return this.distributionEntry.commitMetadata().then(() => {
        // check here ..need to update list rows to update dropdown items
        // this.list.setListModified('replace', this.entry.getResourceURI());
        // this.list.rowMetadataUpdated(this.row, true);
        this.entry.setRefreshNeeded();
        return this.entry.refresh();
      });
    })
      .then(this.onDone)
    );
  },
});

const RemoveFileDialog = declare([RemoveDialog], {
  open(params) {
    this.currentParams = params;
    this.inherited(arguments);
    const list = this.list;
    const gb = list.nlsGenericBundle;
    const sb = list.nlsSpecificBundle;
    const removeConfirmMessage = sb[list.nlsRemoveEntryConfirm] ?
      sb[list.nlsRemoveEntryConfirm] : gb[list.nlsRemoveEntryConfirm];
    const removeFailedMessage = sb[list.nlsRemoveFailedKey] ?
      sb[list.nlsRemoveFailedKey] : gb[list.nlsRemoveFailedKey];
    const dialogs = registry.get('dialogs');
    dialogs.confirm(removeConfirmMessage, null, null,
      (confirm) => {
        if (confirm) {
          this.remove().then(() => {
            list.removeRow(params.row);
            params.row.destroy();
          }, () => {
            dialogs.acknowledge(removeFailedMessage);
          }).then(params.onDone);
        } else {
          params.onDone && params.onDone();
          // list.getView().clearSelection();
        }
      });
  },
  remove() {
    this.distributionEntry = this.list.entry;
    this.fileEntry = this.list.fileEntry;
    const fileResourceURI = this.fileEntry.getResourceURI();
    const distMetadata = this.distributionEntry.getMetadata();
    const distResourceURI = this.distributionEntry.getResourceURI();
    distMetadata.findAndRemove(distResourceURI, 'dcat:accessURL', fileResourceURI);
    distMetadata.findAndRemove(distResourceURI, 'dcat:downloadURL', fileResourceURI);
    distMetadata.findAndRemove(distResourceURI, 'dcterms:modified');
    distMetadata.addD(distResourceURI, 'dcterms:modified', stamp.toISOString(new Date()), 'xsd:date');
    return this.distributionEntry.commitMetadata().then(() => {
      // update dropdown menu items
      if (this.currentParams.row.list.parentRow) {
        this.currentParams.row.list.parentRow.updateDropdownMenu();
      }
      return this.currentParams.row.entry.del().then(() => {
        this.list.setListModified('remove', fileResourceURI);
        this.currentParams.row.list.getView().action_refresh();
      });
    });
  },
});

export default (entry, distribution, onUpdate, dom) => {
  const replaceFile = () => {
    const replaceFileDialog = new ReplaceFileDialog({
      list: {
        entry: distribution,
      },
      onDone: onUpdate,
    }, DOMUtil.create('div', null, dom));

    replaceFileDialog.open({
      entry,
      distributionEntry: distribution,
      distributionRow: { renderMetadata: () => {} }, // TODO: @scazan this is handled by m.render now
      row: {
        entry,
        domNode: dom,
      },
      // apiEntryURIs: this.dctSource,
      // apiEntryURIs: fileEntryURIs,
      // datasetEntry: dataset,
    });
  };

  const removeFile = () => {
    const removeFileDialog = new RemoveFileDialog({
      list: {
        entry: distribution,
        fileEntry: entry,
        nlsSpecificBundle: {},
        nlsGenericBundle: {},
      },
    }, DOMUtil.create('div', null, dom));
    removeFileDialog.open({
      onDone: onUpdate,
    });
  };

  const downloadFile = () => {
    const resURI = entry.getResourceURI();
    window.open(resURI, '_blank');
  };

  return {
    removeFile,
    replaceFile,
    downloadFile,
  };
};
