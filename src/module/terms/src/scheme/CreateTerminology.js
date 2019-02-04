import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import registry from 'commons/registry';
import { createEntry } from 'commons/util/storeUtil';
import { isUri } from 'commons/util/util';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import { renderingContext } from 'rdforms';
import esteScheme from 'terms/nls/esteScheme.nls';
import template from './CreateTerminologyTemplate.html';

export default declare([_WidgetBase, _TemplatedMixin, ListDialogMixin, NLSMixin.Dijit], {
  templateString: template,
  nlsBundles: [{ esteScheme }],
  // * to be removed in nls * nlsHeaderTitle: 'createSchemeHeader',
  // * to be removed in nls * nlsFooterButtonLabel: 'createSchemeButton',

  postCreate() {
    this.inherited(arguments);
    this.schemeName.addEventListener('keyup', this.checkValidInfoDelayed.bind(this));
    this.schemeNamespace.addEventListener('keyup', this.checkValidInfoDelayed.bind(this));
  },
  open() {
    if (this.list.onLimit()) {
      console.log('Limit hit!'); // TODO what happens here?
    }
  },
  checkValidInfoDelayed() {
    if (this.delayedCheckTimout != null) {
      clearTimeout(this.delayedCheckTimout);
    }
    this.delayedCheckTimeout = setTimeout(this.checkValidInfo.bind(this), 300);
  },
  checkValidInfo() {
    // check validity of name input
    const name = this.schemeName.value;
    if (name === '') {
      this.dialog.lockFooterButton();
      return;
    }

    // check validity of namespace input
    const namespace = this.schemeNamespace.value;
    if (namespace !== '' && !isUri(namespace)) {
      this.dialog.lockFooterButton();
      return;
    }

    this.dialog.unlockFooterButton();
  },

  /**
   * Clears and resets the form
   *
   * @returns {undefined}
   */
  clearFields() {
    this.schemeName.value = '';
    this.schemeDesc.value = '';
  },

  clear() {
    this.list.getView().clearSearch();
    this.clearFields();
  },
  footerButtonAction() {
    let group;
    let hc;
    const name = this.schemeName.value;
    const desc = this.schemeDesc.value;
    const namespace = this.schemeNamespace.value;

    if (name === '') {
      // TODO remove this nls string as it will never happen (checkValidInfo method above)
      return this.NLSBundle0.insufficientInfoToCreateScheme;
    }
    let context;
    const store = registry.get('entrystore');
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
        if (namespace) { // void:uriSpace is actually a URL literal
          md.addL(pe.getResourceURI(), 'void:uriSpace', namespace);
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
            this.clearFields();
            const userEntry = registry.get('userEntry');
            userEntry.setRefreshNeeded();
            return userEntry.refresh();
          });
        });
      });
  },
});
