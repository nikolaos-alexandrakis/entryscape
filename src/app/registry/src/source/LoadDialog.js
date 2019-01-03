import EntryType from 'commons/create/EntryType';
import TitleDialog from 'commons/dialog/TitleDialog';
import registry from 'commons/registry';
import { readFileAsText } from 'commons/util/fileUtil';
import htmlUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import { converters } from 'rdfjson';

export default declare([TitleDialog], {
  explicitNLS: true,
  bundle: null,
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
  show(callback, bundle) {
    this.entryType.show(true, true, false);
    this.inherited(arguments);
    this.callback = callback;
    this.updateLocaleStringsExplicit(
      bundle.loadTitle,
      bundle.loadButton, bundle.loadButtonTitle,
    );
  },
  footerButtonAction() {
    const cb = this.callback;
    const entryTypeValue = this.entryType.getValue();

    if (this.entryType.isFile()) {
      /** @type HTMLInputElement */
      const inputElement = this.entryType.getFileInputElement();
      /** @type File */
      const file = inputElement.files.item(0);

      // read file in browser and try to parse RDF
      return readFileAsText(file).then((data) => {
        const report = converters.detect(data);

        // the resolve is used for the footerButtonAction while the callback for the functionality
        // TODO somehow merge resolve and callback
        return Promise.resolve(cb(report.graph, entryTypeValue));
      }, err => Promise.reject(err)); // TODO nls
    }

    return registry.get('entrystore').loadViaProxy(entryTypeValue, 'application/rdf+xml').then(f);
  },
});
