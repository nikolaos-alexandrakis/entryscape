import registry from 'commons/registry';
import config from 'config';
import keys from 'commons/util/keyCodeUtil';
import Tree from 'commons/tree/Tree';
import EntryChooser from 'commons/rdforms/choosers/EntryChooser';
import Placeholder from 'commons/placeholder/Placeholder';
import ViewMixin from 'commons/view/ViewMixin';
import { LevelEditor, renderingContext } from 'rdforms';
import skosRepair from 'commons/tree/skos/repair';
import skosUtil from 'commons/tree/skos/util';
import { i18n, NLSMixin } from 'esi18n';
import esteConcept from 'terms/nls/esteConcept.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import aspect from 'dojo/aspect';
import jquery from 'jquery';
import { createEntry } from 'commons/util/storeUtil';
import utils from '../utils';
import template from './ConceptsTemplate.html';
import './style.css';

const isNodeInLi = (leaf, parent) => {
  if (leaf === parent) {
    return false;
  } else if (leaf.nodeName === 'LI') {
    return true;
  }
  return isNodeInLi(leaf.parentNode, parent);
};

EntryChooser.registerDefaults();

const ConceptPlaceholder = declare([Placeholder], {
  missingImageClass: 'cube',
  getText() {
    return this.concepts.NLSBundle0.emptyTreeWarning;
  },
});

export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit, ViewMixin], {
  templateString: template,
  nlsBundles: [{ esteConcept }],

  postCreate() {
    this._editor = new LevelEditor({ compact: false }, this._editor);
    this._editor.domNode.classList.add('conceptEditor');
    this._conceptTree = new Tree({}, this._conceptTree);
    this._conceptTree.disallowedSiblingMove = () => {
      const message = this.NLSBundle0.cannotReorderTerm;
      registry.get('dialogs').acknowledge(message);
    };
    this._selectNodeListener = this.selectNodeListener.bind(this);
    this.inherited(arguments);
  },
  show(viewParams) {
    this.inherited('show', arguments);
    this.currentParams = viewParams;
    delete this.currentSelectedEntry;
    const context = registry.get('context');
    this.unBindEvents();
    this.showEditorPlaceholder();

    registry.get('entrystoreutil').getEntryByType('skos:ConceptScheme', context)
      .then((csEntry) => {
        this.conceptScheme = csEntry;
        this._conceptTree.showEntry(csEntry);

        // every time model consistency is updated check if you need to show an error
        aspect.after(this._conceptTree.getTreeModel(), 'setModelConsistency', this._toggleTreeError.bind(this));

        const label = registry.get('rdfutils').getLabel(csEntry);
        this.__selectedTerm.innerHTML = label;

        this._conceptTree.getTreeModel().isMoveAllowed =
          (child, from, to) => utils.isUnModified([child, from, to]).then(null, () => {
            const b = this.NLSBundle0;
            return registry.get('dialogs').confirm(b.concurrentConflictMessage, b.concurrentConflictOk).then(() => {
              this.show(viewParams);
              return false;
            });
          });
        this.bindEvents();
      });
  },

  bindEvents() {
    jquery(this._conceptTree.domNode).on('select_node.jstree', this._selectNodeListener);
    const f = this.clear.bind(this);
    this._conceptTree.domNode.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (!isNodeInLi(ev.target, ev.currentTarget)) {
        setTimeout(() => {
          this._askToProceedIfChanged().then(f);
        }, 1);
      }
    });
  },
  unBindEvents() {
    jquery(this._conceptTree.domNode).off('select_node.jstree', this._selectNodeListener);
    // jquery(this.sidebar).off(); off with no parameters doesn't seem to do anything https://api.jquery.com/off/
  },
  selectNodeListener(ev, obj) {
    this._conceptTree.getTreeModel().getEntry(obj.node)
      .then(entry => registry.set('entry', entry))
      .then(() => this._treeClick());
  },
  clear() {
    if (this.currentSelectedEntry) {
      const node = this._conceptTree.getTreeModel().getNode(this.currentSelectedEntry);
      this._conceptTree.getTree().deselect_all(true);
      this._conceptTree.getTree().dehover_node(node);

      this._editor.domNode.style.display = 'none';
      delete this.currentSelectedEntry;
      this._updateButtons();
      this.showEditorPlaceholder();
    }
    // this.__placeholder
  },
  /**
   * Clears the current editor panel and shows a placeholder.
   */
  showEditorPlaceholder() {
    this.__placeholder.style.display = '';
    this.__editorBlock.style.display = 'none';
    this.__conceptEditorMain.classList.remove('active');
  },
  localeChange() {
    this._updateButtons();
    if (!this.placeholder) {
      this.placeholder = new ConceptPlaceholder({ concepts: this }, this.__placeholder);
      this.__placeholder = this.placeholder.domNode;
    }
    this.placeholder.render();
  },
  _checkKey(ev) {
    if (ev.keyCode === keys.ENTER) {
      this._newC();
    }
  },
  _newC() {
    const defLang = renderingContext.getDefaultLanguage();
    const termLabel = this._termLabel;
    const label = termLabel.value;
    if (label === '' || label == null) {
      return;
    }
    const pe = createEntry(null, 'skos:Concept');
    const ct = this._conceptTree;
    const tree = ct.getTree();
    const model = ct.getTreeModel();
    const selNode = ct.getSelectedNode();
    const uri = pe.getResourceURI();
    const graph = pe.getMetadata();
    let l;
    if (typeof defLang === 'string' && defLang !== '') {
      l = defLang;
    }

    skosUtil.addNewConceptStmts({
      md: graph,
      conceptRURI: uri,
      schemeRURI: this.conceptScheme.getResourceURI(),
      isRoot: !selNode,
      label,
      l,
    });

    model.createEntry(pe, selNode || model.getRootNode(), tree).then(() => {
      termLabel.value = '';
    });
  },
  _treeClick() {
    const entry = registry.getEntry();
    this.__conceptEditorMain.classList.add('active');

    if (entry === this.currentSelectedEntry) {
      return;
    }
    const label = registry.get('rdfutils').getLabel(entry);
    this.__selectedTerm.innerHTML = label;
    this._askToProceedIfChanged().then(() => this._updateSelected(entry));
  },
  _askToProceedIfChanged() {
    if (this.currentSelectedEntry != null && this.currentMetadata.isChanged()) {
      return registry.get('dialogs')
        .confirm(
          this.NLSBundle0.conceptChangedMessage,
          this.NLSBundle0.continueAbandonChanges,
          this.NLSBundle0.continueEditing)
        .then(null, () => {
          const tree = this._conceptTree.getTree();
          const model = this._conceptTree.getTreeModel();
          tree.deselect_all();
          tree.select_node(model.getNode(this.currentSelectedEntry));
          throw Error('Do not proceed.');
        });
    }

    return new Promise(resolve => resolve(true));
  },
  _updateSelected(entry) {
    if (entry == null) {
      return;
    }

    // Refresh concept to avoid concurrent editing as far as possible.
    entry.setRefreshNeeded();
    entry.refresh().then(() => {
      const itemstore = registry.get('itemstore');
      this.currentSelectedEntry = entry;
      this.__editorBlock.style.display = '';
      this.__placeholder.style.display = 'none';
      this.currentMetadata = entry.getMetadata().clone();
      const md = this.currentMetadata;

      if (this._editedSignal) {
        this._editedSignal.remove();
      }
      this._editedSignal = aspect.after(md, 'onChange', () => {
        this._updateButton('save', 1);
        this._updateButton('revert', 1);
      });
      this._updateButtons();

      this._editor.domNode.style.display = '';
      const templateId = config.terms.conceptTemplateId || 'skosmos:concept';
      this._editor.show(entry.getResourceURI(), md, itemstore.getItem(templateId));
    });
  },
  _saveC() {
    if (!this.currentSelectedEntry) {
      return;
    }
    this._updateButton('save', 2);
    this.currentSelectedEntry.setMetadata(this.currentMetadata);
    this.currentSelectedEntry.commitMetadata().then(() => {
      this._conceptTree.refresh(this.currentSelectedEntry, false);
      this.currentMetadata.setChanged(false);
      this._updateButtons();
    });
  },
  _deleteC() {
    if (!this.currentSelectedEntry) {
      return;
    }
    const entryRURI = this.currentSelectedEntry.getResourceURI();
    const hasChildrenOrRelatedConcepts =
      skosUtil.hasChildrenOrRelationsConcepts(this.currentSelectedEntry);

    if (hasChildrenOrRelatedConcepts) {
      registry.get('dialogs').acknowledge(this.NLSBundle0.cannotRemoveTermTree);
    } else {
      const label = registry.get('rdfutils').getLabel(this.currentSelectedEntry) || this.currentSelectedEntry.getId();
      const message = i18n.renderNLSTemplate(this.NLSBundle0.confirmRemoveTerm, label);
      registry.get('dialogs').confirm(message).then(() => {
        this._conceptTree.deleteNode().then(() => {
          // for each SKOS mappings delete those mappings
          const prom = skosUtil.getMappingRelations(entryRURI);
          prom.then((mappingRelations) => {
            mappingRelations.forEach((entries, mappedProperty) => {
              entries.forEach((mappedEntry) => {
                mappedEntry.getMetadata()
                  .findAndRemove(mappedEntry.getResourceURI(), mappedProperty, entryRURI);

                mappedEntry.commitMetadata();
                mappedEntry.setRefreshNeeded();
                mappedEntry.refresh();
              });
            });
          });

          this.clear();
        });
      });
    }
  },
  _revertC() {
    if (!this.currentSelectedEntry) {
      return;
    }
    this._updateSelected(this.currentSelectedEntry);
  },
  _updateButtons() {
    if (this.currentSelectedEntry) {
      const state = this.currentMetadata.isChanged() ? 1 : 0;
      const isRoot = this._conceptTree.getTreeModel().isRoot(this.currentSelectedEntry);
      this._updateButton('save', state);
      this._updateButton('revert', state);
      this._updateButton('delete', isRoot ? 0 : 1);
    } else {
      this._updateButton('save', 0);
      this._updateButton('revert', 0);
      this._updateButton('delete', 0);
    }
  },
  _updateButton(action, state) {
    const node = this[`_${action}Button`];
    if (state === 1) { // Ready state
      node.removeAttribute('disabled');
    } else {
      node.setAttribute('disabled', 'disabled');
    }
    if (state === 2) { // Processing state
      node.innerHTML = this.NLSBundle0[`${action}ProcessingButton`];
    } else {
      node.innerHTML = this.NLSBundle0[`${action}Button`];
    }
  },
  /**
   * Called after TreeModel.setModelConsistency
   *
   * @private
   */
  _toggleTreeError() {
    if (!this._conceptTree.getTreeModel().isModelConsistent) {
      const message = this.NLSBundle0.treeInconsistentMessage;
      const prompt = this.NLSBundle0.treeInconsistentPromptLabel;
      registry.get('dialogs').acknowledge(message, prompt).then(() => {
        this._fixTree();
      });
    }
  },
  _fixTree() {
    const context = registry.get('context');

    registry.get('dialogs').progress(
      skosRepair.fix(context).then(() => {
        // tree model is consistent
        this._conceptTree.getTreeModel().setModelConsistency(true, true);
        const message = this.NLSBundle0.treeFixSuccessMessage;
        registry.get('dialogs').acknowledge(message).then(() => {
          this.show(this.currentParams);
        });
      }, () => {
        // TODO any other action?
        const message = this.NLSBundle0.treeFixErrorMessage;
        registry.get('dialogs').acknowledge(message);
      }));
  },
});
