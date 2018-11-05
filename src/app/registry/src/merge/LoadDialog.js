import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import TitleDialog from 'commons/dialog/TitleDialog';
import EntryType from 'commons/create/EntryType';
import {converters} from 'rdfjson';

define([
  'dojo/_base/declare',
], declare => declare([TitleDialog], {
  explicitNLS: true,
  postCreate() {
    this.inherited(arguments);
    this.entryType = new EntryType({
      valueChange: (value) => {
        if (value != null) {
          this.unlockFooterButton();
        } else {
          this.lockFooterButton();
        }
      },
    }, htmlUtil.create('div', null, this.containerNode));
  },
  show(params) {
    this.entryType.show(true, true, false);
    this.inherited(arguments);
    this.callback = params;
    const b = this.merge.NLSBundles.esreMerge;
    this.updateLocaleStringsExplicit(b.loadTitle, b.loadButton, b.loadButtonTitle);
  },
  footerButtonAction() {
    const cb = this.callback;
    const val = this.entryType.getValue();
    const f = (data) => {
      const report = converters.detect(data);
      if (!report.error) {
        cb(report.graph, val);
      } else {
        throw report.error;
      }
    };

    if (this.entryType.isFile()) {
      const inp = this.entryType.getFileInputElement();
      return registry.get('entrystore').echoFile(inp, 'text').then(f);
    }
    return registry.get('entrystore').loadViaProxy(val, 'application/rdf+xml').then(f);
  },
}));
