import registry from 'commons/registry';
import typeIndex from 'commons/create/typeIndex';
import ETBaseList from 'commons/list/common/ETBaseList';
import EditDialog from 'commons/list/common/EditDialog';
import RDFormsEditDialog from 'commons/rdforms/RDFormsEditDialog';
import htmlUtil from 'commons/util/htmlUtil';
import escoList from 'commons/nls/escoList.nls';
import escaResponsible from 'catalog/nls/escaResponsible.nls';
import config from 'config';
import declare from 'dojo/_base/declare';
import { createEntry } from 'commons/util/storeUtil';
import Row from './Row';
import ListView from '../utils/ListView';

const pconf = typeIndex.getConfByName('publisher');
let sharedPublishers = pconf.context != null;
const getPublisherContext = () => {
  if (sharedPublishers) {
    return registry.get('entrystore').getContextById(pconf.context);
  }
  return registry.get('context');
};

const cconf = typeIndex.getConfByName('contactPoint');
const sharedContacts = cconf.context != null;
const getContactContext = () => {
  if (sharedContacts) {
    return registry.get('entrystore').getContextById(cconf.context);
  }
  return registry.get('context');
};
sharedPublishers = sharedPublishers || sharedContacts;

const defaultContactpointType = Array.isArray(cconf.rdfType) ? cconf.rdfType[0] : cconf.rdfType;

const CreateCPDialog = declare([RDFormsEditDialog], {
  maxWidth: 800,
  explicitNLS: true,
  open() {
    this.list.getView().clearSearch();
    this.doneLabel = this.list.nlsSpecificBundle.addContactpoint;
    this.title = this.list.nlsSpecificBundle.createContactpointHeader;
    this.updateTitleAndButton();

    const nds = createEntry(getContactContext(), 'vcard:Kind');
    if (defaultContactpointType) {
      nds.add('rdf:type', defaultContactpointType);
    }
    this._newCP = nds;
    this.show(nds.getResourceURI(), nds.getMetadata(), this.list.getTemplate(nds));
  },
  doneAction(graph) {
    return this._newCP.setMetadata(graph).commit().then((newEntry) => {
      this.list.getView().addRowForEntry(newEntry);
    });
  },
});

const defaultAgentType = config.get('catalog.defaultAgentType', 'foaf:Agent');

const CreateAgentDialog = declare([RDFormsEditDialog], {
  maxWidth: 800,
  explicitNLS: true,
  open() {
    this.doneLabel = this.list.nlsSpecificBundle.createFOAFButton;
    this.title = this.list.nlsSpecificBundle.createFOAFHeader;
    this.updateTitleAndButton();

    const nds = createEntry(getPublisherContext(), 'foaf:Agent');
    this._newAgent = nds;
    nds.getMetadata().add(nds.getResourceURI(), 'rdf:type', defaultAgentType);
    this.show(nds.getResourceURI(), nds.getMetadata(), this.list.getTemplate(nds));
  },
  doneAction(graph) {
    return this._newAgent.setMetadata(graph).commit().then((newEntry) => {
      this.list.getView().addRowForEntry(newEntry);
    });
  },
});

const EditCPDialog = declare([EditDialog], {
  open() {
    this.inherited(arguments);
  },
  updateGenericEditNLS() {
    this.title = this.list.nlsSpecificBundle.editContactpointHeader;
    this.doneLabel = this.list.nlsSpecificBundle.editContactpointFooterButtonLabel;
    this.updateTitleAndButton();
  },
});

const EditPublisherDialog = declare([EditDialog], {
  open() {
    this.inherited(arguments);
  },
  updateGenericEditNLS() {
    this.title = this.list.nlsSpecificBundle.editPublisherHeader;
    this.doneLabel = this.list.nlsSpecificBundle.editPublisherFooterButtonLabel; // Improve
    this.updateTitleAndButton();
  },
});

const ns = registry.get('namespaces');

export default declare([ETBaseList], {
  rowClass: Row,
  restrictToContext: true,
  nlsBundles: [{ escoList }, { escaResponsible }],
  includeCreateButton: false,
  includeInfoButton: false,
  includeEditButton: false,
  searchVisibleFromStart: false,
  contacts: true,
  publishers: true,
  listViewClass: ListView,
  rowClickDialog: 'edit',

  postCreate() {
    const onlyOneCreate = !this.contacts || !this.publishers;
    if (sharedPublishers) {
      this.nlsListHeaderKey = 'listHeaderSharedPublishers';
    }
    if (this.contacts) {
      this.entitytype = 'contactPoint';
      this.emptyListWarningNLS = 'emptyListContactsWarning';
      this.registerListAction({
        name: 'create',
        button: 'success',
        icon: onlyOneCreate ? 'plus' : 'phone fa-lg',
        iconType: 'fa',
        first: true,
        nlsKey: 'addContactpoint',
        nlsKeyTitle: 'addContactpointTitle',
        nlsKeyMessage: 'addContactpointMessage',
      });
      this.registerRowAction({
        name: 'editCP',
        button: 'default',
        iconType: 'fa',
        icon: 'pencil-alt',
        nlsKey: 'editCPLabel',
        nlsKeyTitle: 'editCPTitle',
      });
    } else {
      this.nlsListHeaderKey = sharedPublishers ? 'listHeaderSharedPublishers' : 'publishersListHeader';
    }
    if (this.publishers) {
      this.entitytype = 'publisher';
      this.emptyListWarningNLS = 'emptyListPublishersWarning';
      this.registerListAction({
        name: 'create',
        button: 'success',
        icon: onlyOneCreate ? 'plus' : 'users',
        iconType: 'fa',
        first: true,
        nlsKey: 'addFOAF',
        nlsKeyTitle: 'addFOAFTitle',
        nlsKeyMessage: 'addFOAFMessage',
      });
      this.registerRowAction({
        name: 'editPublisher',
        button: 'default',
        iconType: 'fa',
        icon: 'pencil-alt',
        nlsKey: 'editPublisherLabel',
        nlsKeyTitle: 'editPublisherTitle',
      });
    } else {
      this.nlsListHeaderKey = sharedPublishers ? 'listHeaderSharedContacts' : 'contactpointsListHeader';
    }

    this.includeSizeByDefault = config.get('catalog.includeListSizeByDefault', false);

    this.inherited('postCreate', arguments);
    // Set it to true for placeholder to work
    // It was initially set to false because we do not want the default createButton behaviour
    this.includeCreateButton = true;
    this.registerDialog('create', this.publishers ? CreateAgentDialog : CreateCPDialog);
    // this.registerDialog('createCP', CreateCPDialog);
    // this.registerDialog('createAgent', CreateAgentDialog);
    this.registerDialog('editCP', EditCPDialog);
    this.registerDialog('editPublisher', EditPublisherDialog);
    this.addSharedControls();
  },
  addSharedControls() {
    if ((this.contacts && cconf.allContexts) ||
      (this.publishers && pconf.allContexts)) {
      this.restrictToContext = false;
      const div = htmlUtil.create('div', { class: 'checkbox' }, this.getView().lowerBlockContainer);
      const label = htmlUtil.create('label', null, div);
      const inp = htmlUtil.create('input', { type: 'checkbox', checked: true }, label);
      // The reason for margin-left 7px is a mystery, in
      this.sharedControlLabel = htmlUtil.create('span', {
        class: 'checkboxLabel',
        style: { 'margin-left': '7px' },
      }, label);

      inp.addEventListener('change', () => {
        this.restrictToContext = !inp.hasAttribute('checked');
        this.render();
      });
    }
  },

  localeChange() {
    if (this.contacts) {
      this.nlsCreateEntryLabel = 'addContactpoint';
      this.nlsCreateEntryTitle = 'addContactpointTitle';
    } else if (this.publishers) {
      this.nlsCreateEntryLabel = 'addFOAF';
      this.nlsCreateEntryTitle = 'addFOAFTitle';
    }
    this.inherited(arguments);
    if (this.sharedControlLabel) {
      this.sharedControlLabel.innerHTML = this.NLSLocalized1.showFromAllContexts;
    }
  },

  getTemplate(entry) {
    if (!this.templateFoaf) {
      this.templateFoaf = registry.get('itemstore').getItem(
        config.catalog.agentTemplateId);
      this.templateCP = registry.get('itemstore').getItem(
        config.catalog.contactPointTemplateId);
    }
    if (this.isEntryAgent(entry)) {
      return this.templateFoaf;
    }
    return this.templateCP;
  },
  isEntryAgent(entry) {
    const rdftype = entry.getMetadata().findFirstValue(null, 'rdf:type');
    return rdftype ? rdftype.indexOf(ns.expand('foaf:')) === 0 : false;
  },
  restrictToContactContext(query) {
    if (this.restrictToContext) {
      return query.context(getContactContext());
    }
    return query;
  },
  restrictToPublisherContext(query) {
    if (this.restrictToContext) {
      return query.context(getPublisherContext());
    }
    return query;
  },
  getSearchObject() {
    /** @type {store/EntryStore} */
    const store = registry.get('entrystore');
    if (this.contacts) {
      return this.restrictToContactContext(
        store.newSolrQuery().rdfType(['vcard:Kind', 'vcard:Individual', 'vcard:Organization']));
    } else if (this.publishers) {
      return this.restrictToPublisherContext(
        store.newSolrQuery().rdfType(['foaf:Agent', 'foaf:Person', 'foaf:Organization']));
    }

    return null; // TODO fix this
  },
});
