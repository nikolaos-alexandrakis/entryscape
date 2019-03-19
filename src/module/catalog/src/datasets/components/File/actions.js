import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import DOMUtil from 'commons/util/htmlUtil';
import stamp from 'dojo/date/stamp';
import RemoveDialog from 'commons/list/common/RemoveDialog';
import ReplaceDialog from 'workbench/bench/ReplaceDialog';
import escoListNLS from 'commons/nls/escoList.nls';
import escaFilesListNLS from 'catalog/nls/escaFilesList.nls';

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
        this.entry.setRefreshNeeded();
        return this.entry.refresh();
      });
    })
      .then(this.onDone),
    );
  },
});

// When you remove the File, we need to ask whether "...the API should be refreshed"
const RemoveFileDialog = declare([RemoveDialog], {
  nlsRemoveEntryConfirm: 'confirmRemoveFile',
  nlsRemoveFailedKey: 'removeEntryFailed',
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

export default (entry, distribution, onUpdate) => {
  const replaceFile = () => {
    const dom = DOMUtil.create('div');
    const replaceFileDialog = new ReplaceFileDialog({
      list: {
        entry: distribution,
      },
      onDone: onUpdate,
    }, dom);

    replaceFileDialog.open({
      entry,
      distributionEntry: distribution,
      distributionRow: { renderMetadata: () => {} }, // @scazan this is handled by m.render now
      row: {
        entry,
        domNode: dom,
      },
      // apiEntryURIs: this.dctSource,
    });
  };

  const removeFile = () => {
    const removeFileDialog = new RemoveFileDialog({
      list: {
        entry: distribution,
        fileEntry: entry,
        nlsSpecificBundle: i18n.getLocalization(escaFilesListNLS),
        nlsGenericBundle: i18n.getLocalization(escoListNLS),
      },
    }, DOMUtil.create('div'));
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
