import EntryType from 'commons/create/EntryType';
import typeIndex from 'commons/create/typeIndex';
import TitleDialog from 'commons/dialog/TitleDialog'; // In template
import BaseList from 'commons/list/common/BaseList';
import EntryRow from 'commons/list/EntryRow';
import escoEntryChooser from 'commons/nls/escoEntryChooser.nls';
import escoList from 'commons/nls/escoList.nls';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import { createEntry } from 'commons/util/storeUtil';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import { Editor, LevelEditor, renderingContext, validate } from 'rdforms';
import template from './EntryChooserTemplate.html';

const chooserScope = {};

const getChoice = (entry, obj) => {
  const o = obj || {};
  const rdfutils = registry.get('rdfutils');
  o.value = entry.getResourceURI();
  o.label = rdfutils.getLabel(entry);
  o.description = rdfutils.getDescription(entry);

  return o;
};

const restrictToContext = (item, qo) => {
  const prop = item.getProperty();
  const restr = typeof chooserScope[prop] === 'undefined' || chooserScope[prop] === 'context';
  const conf = typeIndex.getConfFromConstraints(item.getConstraints());

  if (conf && conf.context) {
    qo.context(registry.get('entrystore').getContextById(conf.context));
    // eslint-disable-next-line
  } else if ((conf && conf.allContexts != true) || restr) {
    qo.context(registry.get('context'));
  }
};

const EntryChooserRowAction = declare([], {
  open(params) {
    const choice = getChoice(params.row.entry);
    params.row.list.onSelect(choice);
    params.row.list.entrychooserDialog.hide();
  },
});

const EntryChooserRow = declare([EntryRow], {
  postCreate() {
    this.inherited('postCreate', arguments);
  },
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

const EntryChooserList = declare([BaseList], {
  nlsBundles: [{ escoList }, { escoEntryChooser }],
  nlsCreateEntryMessage: null,
  includeRefreshButton: false,
  includeInfoButton: true,
  includeEditButton: false,
  includeRemoveButton: false,
  includeCreateButton: false,
  includeVersionsButton: false,
  rowClickDialog: 'entryChooserRowAction',
  rowClass: EntryChooserRow,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.registerDialog('entryChooserRowAction', EntryChooserRowAction);
    this.listView.includeResultSize = !!this.includeResultSize; // make this boolean
  },
  getIconClass() {
    if (this.conf && this.conf.faclass) {
      return this.conf.faClass;
    }

    return '';
  },
  getEmptyListWarning() {
    if (this.binding != null) {
      const createLabel = this.binding.getItem().getLabel();
      return i18n.renderNLSTemplate(this.NLSLocalized1.errorMessage, { 1: createLabel });
    }

    return '';
  },

  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').getItem(this.conf.template);
    }
    return this.template;
  },

  search(params) {
    const _params = params || {};
    const term = _params.term != null && _params.term.length > 0 ? _params.term : '';
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    const qo = typeIndex.query(es.newSolrQuery(),
      { constraints: this.binding.getItem().getConstraints() }, term);
    restrictToContext(this.binding.getItem(), qo);

    if (_params.sortOrder === 'title') {
      const l = locale.get();
      qo.sort(`title.${l}+desc`);
    }

    this.listView.showEntryList(qo.list());
  },
});

const EntryChooser = declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: template,
  binding: null,
  onSelect: null,
  nlsBundles: [{ escoRdforms }, { escoEntryChooser }],

  postCreate() {
    this.inherited(arguments);
    this.entryChooserList = new EntryChooserList({ entrychooserDialog: this.dialog },
      DOMUtil.create('div', null, this.searchNode));
    this.dialog.headerExtensionNode.appendChild(this.moveInput);

    this.levels = new LevelEditor({ externalEditor: true },
      DOMUtil.create('div', null, this.levelEditorNode));
    this.editor = new Editor({}, DOMUtil.create('div', null, this.editorNode));
    this.levels.setExternalEditor(this.editor);
    this.fileOrLink = new EntryType({
      valueChange: (value) => {
        if (value != null) {
          this.dialog.unlockFooterButton();
        } else {
          this.dialog.lockFooterButton();
        }
      },
    }, DOMUtil.create('div', null, this.entityTypeNode, true));
  },
  localeChange() {
    if (this.binding != null) {
      const createLabel = this.binding.getItem().getLabel();
      this.dialog.updateLocaleStringsExplicit(
        i18n.renderNLSTemplate(this.NLSLocalized1.searchForHeader, { 1: createLabel }),
        i18n.renderNLSTemplate(this.NLSLocalized1.createEntryType, { 1: createLabel }));
    }
  },
  searchOption() {
    DOMUtil.addClass(this.__searchOptionLabel, 'active');
    DOMUtil.removeClass(this.__createOptionLabel, 'active');
    this.searchNode.style.display = 'block';
    this.createNode.style.display = 'none';
    this.dialog.footerButtonNode.style.display = 'none';
  },
  createOption() {
    DOMUtil.removeClass(this.__searchOptionLabel, 'active');
    DOMUtil.addClass(this.__createOptionLabel, 'active');
    this.searchNode.style.display = 'none';
    this.createNode.style.display = 'block';
    this.dialog.footerButtonNode.style.display = 'block';

    let context;
    if (this.conf && this.conf.context) {
      context = registry.get('entrystore').getContextById(this.conf.context);
    }
    if (!context) {
      context = registry.get('context');
    }
    this._newEntry = createEntry(context);
    const nds = this._newEntry;
    const constraints = this.binding.getItem().getConstraints();
    this._graph = nds.getMetadata();
    const uri = nds.getResourceURI();

    const conf = typeIndex.getConfFromConstraints(constraints);
    const template_ = conf != null ? conf.template : null;

    if (constraints) {
      const subj = this._newEntry.getResourceURI();
      Object.keys(constraints).forEach((prop) => {
        const obj = constraints[prop];
        if (Array.isArray(obj)) {
          this._graph.add(subj, prop, obj[0]);
        } else {
          this._graph.add(subj, prop, obj);
        }
      });
    }

    if (template_) {
      this.editor.graph = null; // Just to avoid re-rendering old form when changing includelevel.
      this.levels.setIncludeLevel(conf.templateLevel || 'mandatory');
      this.editor.hideAddress = true;
      this.editor.show({
        resource: uri,
        graph: nds.getMetadata(),
        template: registry.get('itemstore').getItem(template_),
      });
    }

    this.localeChange();
  },
  show(binding, onSelect) {
    this.binding = binding;
    this.onSelect = onSelect;
    this.entryChooserList.binding = binding;
    this.entryChooserList.onSelect = onSelect;
    this.conf = typeIndex.getConfFromConstraints(this.binding.getItem().getConstraints());
    this.entryChooserList.conf = this.conf;
    if (this.conf && this.conf.inlineCreation) {
      // show  Creation tab
      this.moveInput.style.display = 'block';
      this.fileOrLink.showConfig(this.conf);
    } else {
      // hide Creation tab
      this.moveInput.style.display = 'none';
    }
    this.inherited(arguments);
    this.dialog.footerButtonNode.style.display = 'none';
    this.entryChooserList.render();
    this.dialog.show();
  },
  footerButtonAction() {
    const report = validate.bindingReport(this.editor.binding);
    if (report.errors.length > 0) {
      this.editor.report(report);
      return this.NLSLocalized.escoRdforms.missingMandatoryFields;
    }
    if (!this._graph.isChanged()) {
      return undefined;
    }

    return this.fileOrLink.newEntry(this._newEntry).then((entry) => {
      const choice = getChoice(entry);
      this.onSelect(choice);
    });
  },
});

const async = registry.get('asynchandler');
let asyncCounter = 0;
const ignoreCallType = (callType) => {
  const ct = callType || `ignoreEC${asyncCounter}`;
  asyncCounter += 1;
  async.addIgnore(ct, async.codes.GENERIC_PROBLEM, true);
  return ct;
};


let defaultRegistered = false;
const ext = {
  getChoice(item, value) {
    const obj = {
      value,
      load(onSuccess) {
        const store = registry.get('entrystore');
        const storeutil = registry.get('entrystoreutil');
        const onError = () => {
          obj.upgrade = (binding, callback) => {
            const eChooser = new EntryChooser();
            eChooser.startup();
            eChooser.show(binding, callback);
            eChooser.fileOrLink.setLink(binding.getValue());
            eChooser.createOption();
          };
          obj.label = value;
          obj.mismatch = true; // TODO replace with something else
          onSuccess();
        };
        const entryToObj = (entry) => {
          getChoice(entry, obj);
          delete obj.load;
          return obj;
        };
        if (value.indexOf(store.getBaseURI()) === 0) {
          const euri = store.getEntryURI(store.getContextId(value), store.getEntryId(value));
          return store.getEntry(euri, { asyncContext: ignoreCallType() })
            .then(entryToObj).then(onSuccess, onError);
        } else if (item.hasStyle('internalLink')) {
          let ct;
          if (store.getCache().getByResourceURI(value).length === 0) {
            ct = ignoreCallType('search');
          }
          return storeutil.getEntryByResourceURI(value, null, ct).then(entryToObj).then(
            onSuccess, onError);
        }
        const storeUtil = registry.get('entrystoreutil');
        async.addIgnore('search', async.codes.GENERIC_PROBLEM, true);
        return storeUtil.getEntryByResourceURI(value).then((entry) => {
          getChoice(entry, obj);
          delete obj.load;
          return obj;
        }).then(onSuccess, onError);
      },
    };
    return obj;
  },
  show(binding, onSelect) {
    const eChooser = new EntryChooser();
    eChooser.startup();
    eChooser.show(binding, onSelect);
  },
  supportsInlineCreate(binding) {
    const conf = typeIndex.getConfFromConstraints(binding.getItem().getConstraints());
    return conf && conf.inlineCreation;
  },
  search(item, term) {
    const es = registry.get('entrystore');
    const qo = es.newSolrQuery();
    restrictToContext(item, qo);
    const rdfutils = registry.get('rdfutils');
    return typeIndex.query(qo, { constraints: item.getConstraints() }, term)
      .limit(10).list().getEntries()
      .then(entries => entries.map(e => ({
        value: e.getResourceURI(),
        label: rdfutils.getLabelMap(e),
        description: rdfutils.getDescriptionMap(e),
      })));
  },
  registerDefaults() {
    if (!defaultRegistered) {
      renderingContext.chooserRegistry.itemtype('choice').register(ext);
      defaultRegistered = true;
    }
  },
  chooser: EntryChooser,
  setChooserScope(scope) {
    Object.keys(scope).forEach((key) => {
      chooserScope[key] = scope[key];
    });
  },
};

const chooserScopeConfig = registry.get('entrychooser');
if (chooserScopeConfig) {
  ext.setChooserScope(chooserScopeConfig);
}

export default ext;
