import EntryType from 'commons/create/EntryType';
import TitleDialog from 'commons/dialog/TitleDialog';
import registry from 'commons/registry';
import { readFileAsText } from 'commons/util/fileUtil';
import htmlUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import { isEmpty } from 'lodash-es';
import { converters } from 'rdfjson';

export default declare([TitleDialog], {
  explicitNLS: true,
  postCreate() {
    this.inherited(arguments);
    this.entryType = new EntryType({
      valueChange: (value) => {
        if (!isEmpty(value)) {
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
    const b = this.merge.NLSLocalized.esreMerge;
    this.updateLocaleStringsExplicit(b.loadTitle, b.loadButton, b.loadButtonTitle);
  },
  footerButtonAction() {
    const val = this.entryType.getValue();
    const f = (data) => {
      const report = converters.detect(data);
      if (!report.error) {
        this.callback(report.graph, val);
      } else {
        throw report.error;
      }
    };

    if (this.entryType.isFile()) {
      const inputElement = this.entryType.getFileInputElement();
      /** @type File */
      const file = inputElement.files.item(0);
      return readFileAsText(file).then(f);
    }
    return registry.get('entrystore').loadViaProxy(val, 'application/rdf+xml').then(f);
  },
});
