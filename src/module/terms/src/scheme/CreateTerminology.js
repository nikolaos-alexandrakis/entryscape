import registry from 'commons/registry';
import {renderingContext} from 'rdforms';
import template from './CreateTerminologyTemplate.html';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import {NLSMixin} from 'esi18n';
import esteScheme from 'terms/nls/esteScheme.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import {createEntry} from 'commons/util/storeUtil';

export default declare([_WidgetBase, _TemplatedMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  nlsBundles: [{esteScheme}],
  // * to be removed in nls * nlsHeaderTitle: 'createSchemeHeader',
  // * to be removed in nls * nlsFooterButtonLabel: 'createSchemeButton',

  postCreate() {
    this.inherited(arguments);
    this.schemeName.addEventListener('keyup', this.checkValidInfoDelayed.bind(this));
  },
  open() {
    if (this.list.onLimit()) {
      return;
    }
  },
  checkValidInfoDelayed() {
    if (this.delayedCheckTimout != null) {
      clearTimeout(this.delayedCheckTimout);
    }
    this.delayedCheckTimeout = setTimeout(this.checkValidInfo.bind(this), 300);
  },
  checkValidInfo() {
    const schemeName = this.schemeName.value;
    if (schemeName === '') {
      this.dialog.lockFooterButton();
      return;
    }
    this.dialog.unlockFooterButton();
  },
  clear() {
    this.list.getView().clearSearch();
    this.schemeName.setAttribute('value', '');
    this.schemeDesc.setAttribute('value', '');
  },
  footerButtonAction() {
    let group;
    let hc;
    const name = this.schemeName.value;
    const desc = this.schemeDesc.value;
    const store = registry.get('entrystore');
    if (name === '') {
      // TODO remove this nls string as it will never happen (checkValidInfo method above)
      return this.NLSBundle0.insufficientInfoToCreateScheme;
    }
    let context;
    return store.createGroupAndContext()
      .then((entry) => {
        group = entry;
        hc = entry.getResource(true).getHomeContext();
        context = store.getContextById(hc);
        return entry;
      })
      .then(() => {
        const pe = createEntry(context, 'skos:ConceptScheme');
        const md = pe.getMetadata();
        const l = renderingContext.getDefaultLanguage();
        md.add(pe.getResourceURI(), 'rdf:type', 'skos:ConceptScheme');
        md.addL(pe.getResourceURI(), 'dcterms:title', name, l);
        if (desc) {
          md.addL(pe.getResourceURI(), 'dcterms:description', desc, l);
        }
        return pe.commit();
      })
      .then((skos) => {
        context.getEntry().then((ctxEntry) => {
          const hcEntryInfo = ctxEntry.getEntryInfo();
          hcEntryInfo.getGraph().add(ctxEntry.getResourceURI(),
            'rdf:type', 'esterms:TerminologyContext');
          // TODO remove when entrystore is changed so groups have read access
          // to homecontext metadata by default.
          // Start fix with missing metadata rights on context for group
          const acl = hcEntryInfo.getACL(true);
          acl.mread.push(group.getId());
          hcEntryInfo.setACL(acl);
          // End fix
          return hcEntryInfo.commit().then(() => {
            if (!registry.get('hasAdminRights')) {
              this.list.entryList.setGroupIdForContext(context.getId(), group.getId());
            }
            const row = this.list.getView().addRowForEntry(skos);
            this.list.rowMetadataUpdated(row);
            const userEntry = registry.get('userEntry');
            userEntry.setRefreshNeeded();
            return userEntry.refresh();
          });
        });
      });
  },
});
