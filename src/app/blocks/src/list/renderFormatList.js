import DOMUtil from 'commons/util/htmlUtil';

import { clone } from 'lodash-es';
import declare from 'dojo/_base/declare';
import getEntry from 'blocks/utils/getEntry';
import EntryRow from 'commons/list/EntryRow';
import MetadataExpandRow from './MetadataExpandRow';
import List from './List';
import formats from './formats';
import escoList from 'commons/nls/escoList.nls';
import escaDataset from 'catalog/nls/escaDataset.nls';

class _FormatRowMixin {
  constructor() {
    this.showCol1 = true;
    this.showCol3 = false;
  }
  renderCol1() {
    this.col1Node.style.textAlign = 'left';
    const format = this.entry.getMetadata().findFirstValue(this.entry.getResourceURI(), 'dcterms:format') || this.entry.getEntryInfo().getFormat();
    const abbrev = formats(format);
    this.col1Node.setAttribute('innerHTML', `<span class="label label-success">${abbrev
           }</span>`);
    this.col1Node.setAttribute('title', format);
  }

      // Adapted from renderTitle in entryscape-commons/dataset/DistributionRow.js
  getRenderName() {
    const md = this.entry.getMetadata();
    const subj = this.entry.getResourceURI();
    const title = md.findFirstValue(subj, 'dcterms:title');
    const downloadURI = md.findFirstValue(subj, 'dcat:downloadURL');
    const source = md.findFirstValue(subj, 'dcterms:source');
    if (this.list.NLSBundles.escaDataset && title == null) {
      if (downloadURI != null && downloadURI !== '') {
        return this.list.NLSBundles.escaDataset.defaultDownloadTitle;
      } else if (source != null && source !== '') {
        return this.list.NLSBundles.escaDataset.autoGeneratedAPI;
      }
      return this.list.NLSBundles.escaDataset.defaultAccessTitle;
    }
    return title;
  }

  updateLocaleStrings() {
    this.inherited(arguments);
    this.renderCol1();
  }
    }

const FormatList = declare([List], {
  nlsBundles: [{ escoList }, { escaDataset }],

  updateRowClass() {
    if (this.conf.template != null) {
      this.rowClass = declare([MetadataExpandRow, _FormatRowMixin], {});
      return true;
    }
    this.rowClass = declare([EntryRow, _FormatRowMixin], {});
  },
});

export default function (node, data, items) {
  const obj = clone(data);
  delete obj.relation;
  let formatList;
  getEntry(obj, (entry) => {
    if (formatList) {
      formatList.destroy();
    }
    formatList = new FormatList({ conf: data, itemstore: items, entry }, DOMUtil.create('div'));
    node.appendChild(formatList);
    formatList.show();
  });
}