import escoAcl from 'commons/nls/escoAcl.nls';
import registry from 'commons/registry';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import './acl.css';
import ACLList from './ACLList';
import template from './ACLTemplate.html';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  templateString: template,
  nlsBundles: [{ escoAcl }],
  aclList: null,
  includeOverride: true,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.aclList = new ACLList({ nlsTypeaheadPlaceholderKey: 'searchPrincipals' }, this.aclListNode);
    this.aclList.onChange = () => this.onChange();
    this.contextAclList = new ACLList({
      nlsTypeaheadPlaceholderKey: 'searchPrincipals',
      readOnly: true,
      focusOnResource: true,
    }, this.contextAclListNode);
    this.contextAclList.typeahead.setDisabled(true);
  },

  onChange() {
  },

  show(params) {
    const context = registry.get('context');
    if (context && params.entry) {
      context.getEntryById(params.entry).then(this.showEntry.bind(this));
    }
  },
  showEntry(entry) {
    this.entry = entry;
    this.aclList.setACLFromEntry(entry);
    entry.getContext().getEntry().then(this.showContextEntry.bind(this));
    if (entry.getEntryInfo().hasACL()) {
      // domProp.set(this.customOption, 'checked', true);
      this.customOption.checked = true;
      this.changeToCustomSharing();
    } else {
      // domProp.set(this.inheritedOption, 'checked', true);
      this.inheritedOption.checked = true;
      this.changeToInheritedSharing();
    }
  },
  localeChange() {
    // domAttr.set(this.noContextOwners, 'innerHTML', this.NLSLocalized0.noContextOwners);
    this.noContextOwners.innerHTML = this.NLSLocalized0.noContextOwners;
  },
  showContextEntry(contextEntry) {
    this.contextAclList.setACLFromEntry(contextEntry);
    const acl = contextEntry.getEntryInfo().getACL(true);
    const es = registry.get('entrystore');
    const rdfutils = registry.get('rdfutils');
    if (acl.admin.length === 0) {
      // domStyle.set(this.noContextOwners, 'display', '');
      this.noContextOwners.style.display = '';
      // domAttr.set(this.ownersList, 'innerHTML', '');
      this.ownersList.innerHTML = '';
    } else {
      // domStyle.set(this.noContextOwners, 'display', 'none');
      this.noContextOwners.style.display = 'none';
      // domAttr.set(this.ownersList, 'innerHTML', '');
      this.ownersList.innerHTML = '';
      for (let i = 0; i < acl.admin.length; i++) {
        const span = document.createElement('li');
        span.classList.add('principalName');
        span.innerHTML = acl.admin[i];
        this.ownersList.appendChild(span);

        // const span = domConstruct.create('li', {
        // class: 'principalName',
        // innerHTML: acl.admin[i],
        // }, this.ownersList);


        es.getEntry(es.getEntryURI('_principals', acl.admin[i])).then(
          (entry) => {
            // @scazan: check that "entry" is the first param that is passed to the
            // callback from getEntry()
            // domAttr.set(span, 'innerHTML', rdfutils.getLabel(entry) || entry.getId());
            span.innerHTML = rdfutils.getLabel(entry) || entry.getId();
          },
        );
      }
    }
  },
  changeToInheritedSharing() {
    this.entryACL = false;
    this.domNode.classList.add('inheritedSharingMode');
    this.domNode.classList.remove('explicitSharingMode');
    this.onChange();
  },
  changeToCustomSharing() {
    this.entryACL = true;
    // domClass.remove(this.domNode, 'inheritedSharingMode');
    this.domNode.classList.remove('inheritedSharingMode');
    // domClass.add(this.domNode, 'explicitSharingMode');
    this.domNode.classList.add('explicitSharingMode');
    this.onChange();
  },
  saveACL() {
    const ei = this.entry.getEntryInfo();
    if (this.entryACL) {
      ei.setACL(this.aclList.getACL());
    } else {
      ei.setACL({});
    }
    return ei.commit();
  },
});
