import registry from 'commons/registry';
import TitleDialog from 'commons/dialog/TitleDialog';
import { renderingContext } from 'rdforms';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import config from 'config';
import { NLSMixin } from 'esi18n';
import escaCatalog from 'catalog/nls/escaCatalog.nls';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import { createEntry } from 'commons/util/storeUtil';
import template from './CreateDialogTemplate.html';
import './catalog.css';

const createWithoutPublisher = config.catalog && config.catalog.createWithoutPublisher === true;

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ escaCatalog }],
  nlsHeaderTitle: 'createCatalogHeader',
  nlsFooterButtonLabel: 'createCatalogButton',

  postCreate() {
    if (createWithoutPublisher) {
      this.publisherNode.display = 'none';
    }
    this.inherited(arguments);
  },
  open() {
    if (!registry.get('hasAdminRights')
      && config.catalog
      && parseInt(config.catalog.catalogLimit, 10) === config.catalog.catalogLimit
      && config.catalog.catalogLimitDialog) {
      let exception = false;
      const premiumGroupId = config.entrystore.premiumGroupId;
      if (premiumGroupId) {
        const es = registry.get('entrystore');
        const groups = registry.get('userEntry').getParentGroups();
        exception =
          groups.some(groupEntryURI => es.getEntryId(groupEntryURI) === premiumGroupId);
      }

      if (!exception &&
        this.list.getView().getSize() >= parseInt(config.catalog.catalogLimit, 10)) {
        registry.get('dialogs').restriction(config.catalog.catalogLimitDialog);
        return;
      }
    }
    this.list.getView().clearSearch();

    this.catalogName.value = '';
    this.catalogDesc.value = '';
    this.agentName.value = '';
    this.dialog.show();
  },
  footerButtonAction() {
    let group;
    let hc;
    const name = this.catalogName.value;
    const desc = this.catalogDesc.value;
    const publisher = this.agentName.value;
    const store = registry.get('entrystore');
    if ((!createWithoutPublisher && publisher === '') || desc === '' || name === '') {
      return this.NLSBundles.escaCatalog.insufficientInfoToCreateCatalog;
    }
    let context;
    return store.createGroupAndContext()
      .then((entry) => {
        group = entry;
        hc = entry.getResource(true).getHomeContext();
        context = store.getContextById(hc);
        if (createWithoutPublisher) {
          return entry;
        }
        const ae = context.newNamedEntry();
        const md = ae.getMetadata();
        md.add(ae.getResourceURI(), 'rdf:type', 'foaf:Agent');
        md.addL(ae.getResourceURI(), 'foaf:name', publisher);
        return ae.commit();
      }).then((publisherEntry) => {
        const pe = createEntry(context, 'dcat:Catalog');
        const md = pe.getMetadata();
        const subj = pe.getResourceURI();
        const l = renderingContext.getDefaultLanguage();
        md.add(subj, 'rdf:type', 'dcat:Catalog');
        md.addL(subj, 'dcterms:title', name, l);
        md.addL(subj, 'dcterms:description', desc, l);
        if (!createWithoutPublisher) {
          md.add(subj, 'dcterms:publisher', publisherEntry.getResourceURI());
        }

        return pe.commit();
      }).then(dcat => context.getEntry().then((ctxEntry) => {
        const hcEntryInfo = ctxEntry.getEntryInfo();
        hcEntryInfo.getGraph().add(ctxEntry.getResourceURI(), 'rdf:type', 'esterms:CatalogContext');
        // TODO remove when entrystore is changed so groups have read
        // access to homecontext metadata by default.
        // Start fix with missing metadata rights on context for group
        const acl = hcEntryInfo.getACL(true);
        acl.mread.push(group.getId());
        hcEntryInfo.setACL(acl);
        // End fix
        return hcEntryInfo.commit().then(() => {
          if (this.list.entryList) { // Not available (and not needed) if admin.
            this.list.entryList.setGroupIdForContext(context.getId(), group.getId());
          }
          const row = this.list.getView().addRowForEntry(dcat);
          this.list.rowMetadataUpdated(row);
          const userEntry = registry.get('userEntry');
          userEntry.setRefreshNeeded();
          userEntry.refresh();
        });
      }), (err) => {
        // dialogs.acknowledge(err);
        throw err;
      });
  },
});
