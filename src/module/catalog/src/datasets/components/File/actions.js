import m from 'mithril';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import EntryType from 'commons/create/EntryType';
import DOMUtil from 'commons/util/htmlUtil';
import typeIndex from 'commons/create/typeIndex';

/*
const DownloadDialog = declare(null, {
  open(params) {
    this.entry = params.row.entry;
    const resURI = this.entry.getResourceURI();
    window.open(resURI, '_blank');
  },
});
const FileReplaceDialog = declare(ReplaceDialog, {
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
        this.list.setListModified('replace', this.entry.getResourceURI());
        this.list.rowMetadataUpdated(this.row, true);
        this.entry.setRefreshNeeded();
        return this.entry.refresh();
      });
    }));
  },
});

const RemoveFileDialog = declare([RemoveDialog], {
  remove() {
    this.distributionEntry = this.list.entry;
    this.fileEntry = this.currentParams.row.entry;
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
*/

export default (entry, dom) => {
  return {
  };
};
