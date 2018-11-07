import registry from 'commons/registry';
import RDFormsPresentDialog from 'commons/rdforms/RDFormsPresentDialog';
import templateString from './DistributionDialogTemplate.html';
import config from 'config';
import APIInfo from 'catalog/files/APIInfo';
import {Presenter} from 'rdforms';
import declare from 'dojo/_base/declare';

export default declare([RDFormsPresentDialog], {
  templateString,
  checkForAPI: true,
  postCreate() {
    this.presenter = new Presenter({compact: true}, this.presenter);
    this.apiInfo = new APIInfo({}, this.apiInfo)
  },
  open(entry) {
    if (this.checkForAPI) {
      this.updateApiInfo(entry);
    }
    this.show(entry.getResourceURI(), entry.getMetadata(),
      registry.get('itemstore').getItem(config.catalog.distributionTemplateId));
  },
  updateApiInfo(entry) {
    this.apiInfo.hide();
    const md = entry.getMetadata();
    const es = registry.get('entrystore');
    const ns = registry.get('namespaces');
    const fileEntryResourceURI = md.findFirstValue(entry.getResourceURI(), ns.expand('dcterms:source'));
    if (fileEntryResourceURI != null && fileEntryResourceURI.indexOf(es.getBaseURI()) === 0) {
      const fileEntryURI = es.getEntryURI(
        es.getContextId(fileEntryResourceURI), es.getEntryId(fileEntryResourceURI));

      es.getEntry(fileEntryURI)
        .then((fileEntry) => {
          const pipelineResults = fileEntry.getReferrers(ns.expand('store:pipelineData'));
          if (pipelineResults.length > 0) {
            es.getEntry(pipelineResults[0]).then((pipelineResult) => {
              this.apiInfo.show(pipelineResult);
            });
          }
        });
    }
  },
});