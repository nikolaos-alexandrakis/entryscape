import EntryRow from 'commons/list/EntryRow';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import template from './RowTemplate.html';

const strEndsWith = (str, suffix) => str.match(`${suffix}$`) === suffix; // TODO use lodash?
export default declare([EntryRow], {
  templateString: template,
  showCol1: true,

  postCreate() {
    this.inherited('postCreate', arguments);
    if (this.list.isEntryAgent(this.entry)) {
      this.foafNode.style.display = '';
      this.cpNode.style.display = 'none';
    } else {
      this.foafNode.style.display = 'none';
      this.cpNode.style.display = '';
    }
  },

  updateLocaleStrings() {
    this.inherited('updateLocaleStrings', arguments);
  },

  action_remove() {
    const bundle = this.nlsSpecificBundle;
    const dialogs = registry.get('dialogs');
    const ns = registry.get('namespaces');
    this.getReferences().then((refs) => {
      if (refs.length === 0) {
        dialogs.confirm(bundle.removeResponsible, null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          this.entry.del()
            .then(this.destroy.bind(this), () => dialogs.acknowledge('Failed to remove responsible'))
            .then(() => this.list.removeRow(this));
        });
      } else {
        const lbls = refs.map((ref, idx) => {
          if (idx === 5) {
            return '<li> ...</li>';
          } else if (idx > 5) {
            return '';
          }
          const t = ref.getMetadata().findFirstValue(ref.getResourceURI(), ns.expand('rdf:type')) || '';
          const rdfutils = registry.get('rdfutils');
          let l = rdfutils.getLabel(ref);
          if (l == null) {
            l = i18n.renderNLSTemplate(bundle.entryWithId, `'${ref.getId()}'`);
          } else {
            l = `'${l}'`;
          }
          if (strEndsWith(t, 'Dataset')) {
            return `<li>${i18n.renderNLSTemplate(bundle.datasetAsRemoveItem, { 1: l })}</li>`;
          } else if (strEndsWith(t, 'Catalog')) {
            return `<li>${i18n.renderNLSTemplate(bundle.catalogAsRemoveItem, { 1: l })}</li>`;
          } else if (strEndsWith(t, 'Distribution')) {
            return `<li>${i18n.renderNLSTemplate(bundle.distributionAsRemoveItem, { 1: l })}</li>`;
          }
          return `<li>${i18n.renderNLSTemplate(bundle.otherAsRemoveItem, { 1: l })}</li>`;
        });
        dialogs.acknowledge(
          i18n.renderNLSTemplate(
            bundle.responsibleUnableToRemove, { 1: `<ul class='inUseBy'>${lbls.join('')}</ul>` }));
      }
    });
  },
  getReferences() {
    return registry.get('entrystore').newSolrQuery()
      .objectUri(this.entry.getResourceURI()).getEntries();
  },
});
