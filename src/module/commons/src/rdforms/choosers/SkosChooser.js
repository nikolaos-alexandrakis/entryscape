import { NLSMixin } from 'esi18n';
import Tree from 'commons/tree/Tree';
import skosUtil from 'commons/tree/skos/util';
import { renderingContext } from 'rdforms';
import config from 'config';
import BaseList from 'commons/list/common/BaseList';
import ConceptRow from 'commons/tree/skos/ConceptRow';
import jquery from 'jquery';
import { toggleClass, togglePropertyValue, toggleDisplayNoneEmpty } from 'commons/util/cssUtil';
import escoList from 'commons/nls/escoList.nls';
import escoSkosChooser from 'commons/nls/escoSkosChooser.nls';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import TitleDialog from 'commons/dialog/TitleDialog'; // In template
import registry from 'commons/registry'; // Provides namespaces, context, entrystore and rdfutils in registry.
import DOMUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import template from './SkosChooserTemplate.html';
import './escoSkosChooser.css';

const getLabel = (entry) => {
  const rdfutils = registry.get('rdfutils');
  let label = rdfutils.getLabel(entry);
  if (label && label.match('^[0-9]+$')) {
    const alt = entry.getMetadata().findFirstValue(entry.getResourceURI(), 'skos:altLabel');
    if (alt) {
      label += ` - ${alt}`;
    }
  }
  return label;
};
const getChoice = (entry, obj) => {
  const rdfutils = registry.get('rdfutils');
  const o = obj || {};
  o.value = entry.getResourceURI();
  o.label = getLabel(entry);
  o.description = rdfutils.getDescription(entry);
  return o;
};

/**
 * Check if the property is a mapping property or a relational property.
 * Mapping property -> false
 * Relational property -> true
 *
 * @param property fully expanded
 * @return {Boolean}
 */
const canTerminologyMapToSelf = (property) => {
  const ns = registry.get('namespaces');
  /** @type Set */
  const mappingProperties = skosUtil.getMappingProperties();
  const expandedMappingProperties = mappingProperties.map(ns.expand);

  return !expandedMappingProperties.includes(property);
};

/**
 * Commit the selected choice and close the dialog.
 *
 * Used by both tree and list views.
 */
const HandleChoiceSelection = declare([], {
  handle(params) {
    const { entry, onSelect, dialog } = params;
    const choice = getChoice(entry);
    onSelect(choice);
    dialog.hide();
  },
});

/**
 * On list click call HandleChoiceSelection
 */
const ConceptRowAction = declare([HandleChoiceSelection], {
  open(params) {
    const { entry, list } = params.row;
    const bundleParams = {
      entry,
      onSelect: list.onSelect,
      dialog: list.skoschooserDialog,
    };

    this.handle(bundleParams);
  },
});

const SkosChooserRow = declare([ConceptRow], {
  getRenderName() {
    const rdfutils = registry.get('rdfutils');
    let titleExtra = '';
    let name = rdfutils.getLabel(this.entry);
    const choice = getChoice(this.entry);
    if (choice.value === this.list.binding.getValue()) {
      titleExtra = ` (${this.nlsSpecificBundle.currentValueMark})`;
      if (name !== null) {
        name += titleExtra;
      }
    }
    return name;
  },
});

const SkosChooserTree = declare([Tree], {
  constructor(params) {
    this.srcNodeRef = params.srcNodeRef;
    this.jsTreeConf = params.jsTreeConf;
  },
  bindEvents(onSelect, dialog) {
    jquery(this.domNode).on('select_node.jstree', (ev, obj) => {
      this.getTreeModel().getEntry(obj.node).then((entry) => {
        // commit choice
        HandleChoiceSelection().handle({ entry, onSelect, dialog });

        // unbind events from tree
        this.unBindEvents();
      });
    });

    jquery(this.domNode).on('click', (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
    });

    jquery(this.domNode).on('show_icons.jstree', (ev, obj) => {
      console.log(ev);
      console.log(obj);
    });
  },
  unBindEvents() {
    jquery(this.domNode).off('select_node.jstree');
  },
});

const SkosChooserList = declare([BaseList], {
  nlsBundles: [{ escoList }, { escoSkosChooser }],
  nlsCreateEntryMessage: null,
  includeRefreshButton: false,
  includeInfoButton: true,
  includeEditButton: false,
  includeRemoveButton: false,
  includeResultSize: false,
  includeCreateButton: false,
  rowClickDialog: 'conceptRowAction',
  rowClass: SkosChooserRow,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.registerDialog('conceptRowAction', ConceptRowAction);
    this.listView.includeResultSize = !!this.includeResultSize; // make this boolean
  },

  getIconClass() {
    return 'sitemap';
  },

  getSearchObject() {
    const ns = registry.get('namespaces');
    const rdfType = ns.expand('rdf:type');
    let searchObj = registry.get('entrystore').newSolrQuery();
    const constraints = this.binding.getItem().getConstraints();
    const skosInScheme = registry.get('namespaces').expand('skos:inScheme');
    if (constraints != null && constraints[rdfType] != null) {
      searchObj = searchObj.rdfType(constraints[rdfType]);
    }
    // check for selectedSkosConceptSchemaURI
    if (this.selectedSkosConceptSchemaURI === 'all') {
      searchObj = searchObj.uriProperty(skosInScheme, this.inSchemeResourceURIs);
      if (!canTerminologyMapToSelf(this.itemProperty)) {
        searchObj = searchObj.objectUri(this.currentContextRURI, true);
      }
    } else {
      searchObj = searchObj.uriProperty(skosInScheme, this.selectedSkosConceptSchemaURI);

      // remove current entry from search results
      // TODO this is potentially dangerous if the same entry exists in other terminlogies
      const en = registry.get('entry');
      if (en) {
        searchObj = searchObj.uri(en.getURI(), true);
      }
    }

    const searchText = this.listView.searchTermNode.value;
    if (searchText != null && searchText.length > 0) {
      searchObj = searchObj.title(searchText);
    }
    return searchObj.limit(10);
  },
  getTemplate() {
    // check replace with appropriate template
    return registry.get('itemstore').getItem('skosmos:concept');
  },
});

const SkosChooser = declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: template,
  binding: null,
  onSelect: null,
  maxWidth: 800,
  nlsBundles: [{ escoRdforms }, { escoSkosChooser }],
  includeFooter: false,

  postCreate() {
    this.inherited(arguments);

    this.currentContextRURI = registry.get('context').getResourceURI();

    // init list view
    this.skosChooserList = new SkosChooserList({
      skoschooserDialog: this.dialog,
      currentContextRURI: this.currentContextRURI,
    }, this.__listView);

    // init tree view
    this.skosChooserTree = new SkosChooserTree({
      srcNodeRef: this.__treeView,
      jsTreeConf: {
        core: {
          multiple: false,
          themes: {
            name: 'proton',
            icons: false,
          },
        },
      },
    });

    // default view selection
    this.viewNodes = [this.__listViewer, this.__treeViewer];
    this.selectedView = 'list';
    this.__listViewer.style['pointer-events'] = 'none';
  },
  getInSchemeEntries(skosinSchemeRURIs) {
    const esu = registry.get('entrystoreutil');
    const inSchemeEntries = skosinSchemeRURIs.map(
      skosinSchemeRURI => esu.getEntryByResourceURI(skosinSchemeRURI),
    );
    return Promise.all(inSchemeEntries);
  },
  getSchemeResourceURIs() {
    const ns = registry.get('namespaces');
    const rdfType = ns.expand('rdf:type');
    // get constraint and property and check in config and get skosconceptURI
    // or display all available concepts and terminologies
    let skosinSchemeRURIs = [];
    const skosInScheme = ns.expand('skos:inScheme');
    if (this.itemConstraints != null && this.itemConstraints[skosInScheme] != null) {
      const sisResourceURIs = this.itemConstraints[skosInScheme];
      skosinSchemeRURIs = Array.isArray(sisResourceURIs) ? sisResourceURIs : [sisResourceURIs];
      // render dropdown
    } else if (this.itemConstraints != null && this.itemConstraints[rdfType] != null) {
      // read property
      // get skosconfig from conf
      if (config && config.skosmapping) {
        const skosmapping = config.skosmapping;
        skosmapping.forEach((skosConf) => {
          if (skosConf.property === this.itemProperty) {
            const sisResourceURIs = skosConf.skosinSchemeRURI;
            skosinSchemeRURIs = Array.isArray(sisResourceURIs)
              ? sisResourceURIs : [sisResourceURIs];
          }
        });
      }
    }
    return skosinSchemeRURIs;
  },
  populateConceptSchemes() {
    this.itemConstraints = this.binding.getItem().getConstraints();
    this.itemProperty = this.binding.getItem().getProperty();
    const inskosinSchemeRURIs = this.getSchemeResourceURIs();

    this.skosChooserList.itemProperty = this.itemProperty; // pass this to the list as well

    if (this.selectedSkosConceptSchemaURI) {
      return this.getInSchemeEntries(inskosinSchemeRURIs)
        .then(terminologies => Promise.all(terminologies.forEach(
          terminology => this.addSkosConceptSchemes(terminology),
        )));
    }

    this.inSchemeResourceURIs = [];
    this.optionEle = undefined;
    this.__skosConceptSchemaList.innerHTML = '';
    if (inskosinSchemeRURIs.length > 0) {
      if (inskosinSchemeRURIs.length === 1) {
        this.selectedSkosConceptSchemaURI = inskosinSchemeRURIs;// setting default value to render
        this.__skosConceptSchemaList.style.display = 'none';
        return Promise.all();
      }
      // add terminologies and display all
      this.skosConceptSchemas = [];
      this.__skosConceptSchemaList.style.display = 'block';
      this.optionEle = DOMUtil.create('option', { value: 'all', innerText: this.NLSLocalized.escoSkosChooser.optionAll }, this.__skosConceptSchemaList);
      this.selectedSkosConceptSchemaURI = null; // setting default value to render
      return this.getInSchemeEntries(inskosinSchemeRURIs)
        .then(terminologies => Promise.all(terminologies.forEach((terminology) => {
          // if this is a non-mapping relation OR terminology in the loop is not same
          // as the context teminology then add to the terminology list
          if (canTerminologyMapToSelf(this.itemProperty)) {
            this.addSkosConceptSchemes(terminology);
          } else if (terminology.getContext().getResourceURI() !== this.currentContextRURI) {
            this.addSkosConceptSchemes(terminology);
          }
        })))
        .then(() => {
          if (this.selectedSkosConceptSchemaURI == null) {
            this.selectedSkosConceptSchemaURI = 'all';
          }
        });
    } // default
    this.skosConceptSchemas = [];
    this.__skosConceptSchemaList.style.display = 'block';
    this.optionEle = DOMUtil.create('option', { value: 'all', innerText: this.NLSLocalized.escoSkosChooser.optionAll }, this.__skosConceptSchemaList);
    this.selectedSkosConceptSchemaURI = null;
    return registry.get('entrystore').newSolrQuery().rdfType('skos:ConceptScheme')
      .list()
      .forEach((terminology) => {
        // if this is a non-mapping relation OR terminology in the loop is not same
        // as the context teminology then add to the terminology list
        if (canTerminologyMapToSelf(this.itemProperty)) {
          this.addSkosConceptSchemes(terminology);
        } else if (terminology.getContext().getResourceURI() !== this.currentContextRURI) {
          this.addSkosConceptSchemes(terminology);
        }
      })
      .then(() => {
        if (this.selectedSkosConceptSchemaURI == null) {
          this.selectedSkosConceptSchemaURI = 'all';
        }
      });
  },
  addSkosConceptSchemes(terminology) {
    const rdfutils = registry.get('rdfutils');
    const name = rdfutils.getLabel(terminology);
    const option = DOMUtil.create('option', {
      value: terminology.getResourceURI(),
    }, this.__skosConceptSchemaList);

    option.innerHTML = name;

    if (terminology.getContext() === registry.get('context') && this.selectedSkosConceptSchemaURI == null) {
      this.selectedSkosConceptSchemaURI = terminology.getResourceURI();
      option.selected = true;
    }
    this.skosConceptSchemas.push({ skosConceptScheme: terminology, elementItem: option });
    this.inSchemeResourceURIs.push(terminology.getResourceURI());
  },
  localeChange() {
    if (this.binding != null) {
      this.dialog.titleNode.innerHTML = this.NLSLocalized.escoSkosChooser.searchForHeader;
    }

    if (this.optionEle != null) {
      this.optionEle.innerHTML = this.NLSLocalized.escoSkosChooser.optionAll;
    }
  },
  selectSkosChooser(e) {
    const target = e.target || e.srcElement;
    this.selectedSkosConceptSchemaURI = target.value;
    this.skosChooserList.selectedSkosConceptSchemaURI = target.value;
    this.renderView();
  },
  renderView() {
    const esu = registry.get('entrystoreutil');
    switch (this.selectedView) {
      case 'tree':
        // TODO this mash of ids and domnodes happens because Tree does not honor the predefined
        // id in the template and the list does
        this.skosChooserList.domNode.style.display = 'none';
        this.__treeView.style.display = 'block';

        esu.getEntryByResourceURI(this.selectedSkosConceptSchemaURI)
          .then((entry) => {
            this.skosChooserTree.showEntry(entry);
            this.skosChooserTree.bindEvents(this.onSelect, this.dialog);
          });
        break;
      case 'list':
      default:
        this.__treeView.style.display = 'none';
        this.skosChooserList.domNode.style.display = 'block';

        this.skosChooserList.render();
    }
  },
  populateListView(binding, onSelect) {
    this.binding = binding;
    this.onSelect = onSelect;
    this.skosChooserList.binding = binding;
    this.skosChooserList.onSelect = onSelect;
    return this.populateConceptSchemes().then(() => {
      this.skosChooserList.inSchemeResourceURIs = this.inSchemeResourceURIs;
      this.skosChooserList.selectedSkosConceptSchemaURI = this.selectedSkosConceptSchemaURI;
    });
  },
  show(binding, onSelect) {
    this.populateListView(binding, onSelect).then(() => this.skosChooserList.render());
    this.dialog.show();
  },
  hide() {
    this.dialog.hide();
  },
  _displaySelectTerminologyMsg() {
    // show some message to select a terminology first and exit
    toggleDisplayNoneEmpty([this.__terminologyFirstAlert]); // TODO
    setTimeout(() => {
      jquery(this.__terminologyFirstAlert).fadeOut('slow');
    }, 2000);
  },
  selectSkosChooserView(e) {
    e.stopPropagation();
    e.preventDefault();
    const view = e.currentTarget.dataset.view || '';

    // set view
    switch (view) {
      case 'tree':
        if (this.selectedSkosConceptSchemaURI === 'all') {
          this._displaySelectTerminologyMsg();
          return false;
        }
        this.selectedView = 'tree';
        break;
      case 'list':
      default:
        this.selectedView = 'list';
        break;
    }

    // render tree or list viewer
    this.renderView();

    // Manage CSS
    toggleClass(this.viewNodes, 'active'); // NOTE! this only works for 2 views
    togglePropertyValue(this.viewNodes, {
      prop: 'pointer-events',
      val1: 'none',
      val2: 'auto',
    });

    return true;
  },
});

let asyncCounter = 0;
let defaultRegistered = false;
const ext = {
  getChoice(item, value) {
    const obj = {
      value,
      load(onSuccess) {
        const store = registry.get('entrystore');
        const async = registry.get('asynchandler');
        const onError = () => {
          obj.label = `Could not load concept: ${value}`;
          obj.mismatch = true; // TODO replace with something else
          onSuccess();
        };
        if (value.indexOf(store.getBaseURI()) === 0) {
          const euri = store.getEntryURI(store.getContextId(value), store.getEntryId(value));
          const ac = `ignoreSC${asyncCounter}`;
          asyncCounter += 1;
          async.addIgnore(ac, async.codes.GENERIC_PROBLEM, true);
          store.getEntry(euri, { asyncContext: ac }).then((entry) => {
            getChoice(entry, obj);
            delete obj.load;
            return obj;
          }).then(onSuccess, onError);
        } else {
          const storeUtil = registry.get('entrystoreutil');
          async.addIgnore('search', async.codes.GENERIC_PROBLEM, true);
          storeUtil.getEntryByResourceURI(value).then((entry) => {
            getChoice(entry, obj);
            delete obj.load;
            return obj;
          }).then(onSuccess, onError);
        }
      },
    };
    return obj;
  },
  show(binding, onSelect) {
    const skosChooser = new SkosChooser();
    skosChooser.startup();
    skosChooser.show(binding, onSelect);
  },
  search(item, term) {
    const ns = registry.get('namespaces');
    const qo = registry.get('entrystore').newSolrQuery().limit(10);
    const constraints = item.getConstraints();
    qo.rdfType('skos:Concept');

    // check for selectedSkosConceptSchemaURI
    const inS = constraints[ns.expand('skos:inScheme')];
    if (inS) {
      qo.uriProperty('skos:inScheme', inS);
    }
    if (!canTerminologyMapToSelf(item.getProperty())) {
      qo.context(registry.get('context'), true); // don't search in the current context
    }
    const en = registry.get('entry');
    if (en) {
      qo.uri(en.getURI(), true);
    }
    if (term != null && term.length > 0) {
      qo.title(term);
    }
    const rdfutils = registry.get('rdfutils');
    return qo.limit(10).list().getEntries().then(entries => entries.map(e => ({
      value: e.getResourceURI(),
      label: getLabel(e),
      description: rdfutils.getDescriptionMap(e),
    })));
  },
  registerDefaults() {
    if (!defaultRegistered) {
      renderingContext.chooserRegistry.constraint({
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.w3.org/2004/02/skos/core#Concept',
        'http://www.w3.org/2004/02/skos/core#inScheme': '',
      }).register(ext);
      renderingContext.chooserRegistry.constraint({ 'http://www.w3.org/2004/02/skos/core#inScheme': '' }).register(ext);
      defaultRegistered = true;
    }
  },
  chooser: SkosChooser,
};

export default ext;
