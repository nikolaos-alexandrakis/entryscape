import { Graph } from 'rdfjson';
import { Editor, engine, LevelEditor, renderingContext, validate } from 'rdforms';
import TitleDialog from 'commons/dialog/TitleDialog';
import registry from 'commons/registry';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import { NLSMixin, i18n } from 'esi18n';
import declare from 'dojo/_base/declare';
import DOMUtil from 'commons/util/htmlUtil';
import PresentExpandable from './PresentExpandable';
import Lookup from '../types/Lookup';
import EntityChooser from './EntityChooser';

export default declare([TitleDialog, NLSMixin.Dijit], {
  nlsHeaderTitle: 'metadataEditDialogHeader',
  nlsFooterButtonLabel: 'metadataEditDialogDoneLabel',
  nlsBundles: [{ escoRdforms }],
  discardWarning: null,
  discardOption: null,
  keepOption: null,
  tooFewFields: null,
  tooManyFields: null,
  tooFewOrTooManyFields: null,
  title: null,
  doneLabel: null,
  doneTitle: null,
  explicitNLS: false,
  localizationParams: {},

  postCreate() {
    this.etChooser = new EntityChooser({ onChange: this.updateEntityType.bind(this) },
      DOMUtil.create('div', null, this.headerExtensionNode));
    this.levels = new LevelEditor({ externalEditor: true },
      DOMUtil.create('div', null, this.headerExtensionNode));
    this.levels.domNode.classList.add('escoLevels');
    this.editor = new Editor({}, DOMUtil.create('div', null, this.containerNode));
    this.externalMetadata = new PresentExpandable({}, DOMUtil.create('div', null, this.containerNode, true));
    this.externalMetadata.style.display = 'none';
    this.levels.setExternalEditor(this.editor);
    this.inherited('postCreate', arguments);
  },

  updateEntityType() {
    const tid = this.etChooser.getInUse().templateId();
    const template = registry.get('itemstore').getItem(tid);
    this.updateEditor(this.uri, this.graph, template, this.editor.includeLevel);
    this.unlockFooterButton();
  },

  localeChange() {
    const bundle = i18n.getLocalization(escoRdforms);
    renderingContext.setMessages(bundle);
    this.levels.localize(bundle);
    this.discardWarning = bundle.discardMetadataChangesWarning;
    this.discardOption = bundle.discardMetadataChanges;
    this.keepOption = bundle.keepMetadataChanges;
    this.saveChanges = bundle.saveChanges;
    this.tooFewFields = bundle.tooFewFields;
    this.tooManyFields = bundle.tooManyFields;
    this.tooFewOrTooManyFields = bundle.tooFewOrTooManyFields;
    this.defaultMessage.innerHTML =
      `<span class="mandatoryMark">*</span>${bundle.mandatoryMarkExplanation}`;
    this.updateTitleAndButton();
  },
  updateTitleAndButton() {
    if (this.explicitNLS && (this.title !== '' || this.title === null)) {
      this.updateLocaleStringsExplicit(this.title, this.doneLabel, this.doneTitle);
    } else {
      this.updateLocaleStrings(this.NLSLocalized.escoRdforms, this.localizationParams);
    }
    this.updateHeaderWidth();
  },

  show(uri, graph, template, level) {
    this.updateEditor(uri, graph, template, level);
    this.inherited(arguments);
  },

  async showChildEntry(entry, parentEntry, level) {
    const uri = entry.getResourceURI();
    const inUse = await Lookup.inUse(entry, parentEntry);
    this.etChooser.update(entry, inUse);
    const t = registry.get('itemstore').getItem(inUse.templateId());
    this.updateExternalMetadata(entry, t);
    this.show(uri, entry.getMetadata(), t, level);
  },
  async showEntry(entry, template, level) {
    const uri = entry.getResourceURI();
    if (template) {
      this.etChooser.clear();
      this.etChooser.hide();
      this.updateExternalMetadata(entry, template);
      this.show(uri, entry.getMetadata(), template, level);
    } else {
      const inUse = await Lookup.inUse(entry);
      this.etChooser.update(entry, inUse);
      const t = registry.get('itemstore').getItem(inUse.templateId());
      this.updateExternalMetadata(entry, t);
      this.show(uri, entry.getMetadata(), t, level);
    }
  },

  updateEntry(entry, template, level) {
    const uri = entry.getResourceURI();
    this.updateEditor(uri, entry.getMetadata(), template, level);
    this.updateExternalMetadata(entry, template);
  },

  updateExternalMetadata(entry, template) {
    const graph = entry.getCachedExternalMetadata();
    if ((entry.isLinkReference() || entry.isReference()) && !graph.isEmpty()) {
      this.externalMetadata.style.display = 'block';
      this.externalMetadata.show(entry.getResourceURI(), graph, template);
    } else {
      this.externalMetadata.style.display = 'none';
    }
  },

  updateEditor(uri, graph, template, level) {
    this.uri = uri;
    this.graph = new Graph(graph.exportRDFJSON());
    this.template = template;
    const profile = engine.levelProfile(template);
    const detectLevel = engine.detectLevel(profile);
    let givenLevel = level;
    if (profile.itemCount <= 5 || detectLevel.indexOf('mixed') === -1) {
      this.levels.domNode.style.display = 'none';
      givenLevel = 'optional'; // Show all since there are markings to distinguish them
    } else {
      this.levels.domNode.style.display = '';
      if (givenLevel == null) {
        if (profile.mandatory === 0) {
          givenLevel = 'recommended';
        } else {
          givenLevel = 'mandatory';
        }
      }

      // Disable any property in the levels that have no fields
      Object.entries(profile).forEach((keyVal) => {
        const [key, val] = keyVal;
        if ((val <= 0) && (key !== 'itemCount')) {
          this.levels.disableLevel(key);
        }
      });
    }
    this.editor.graph = null; // Just to avoid re-rendering old form when changing includelevel.
    this.levels.setIncludeLevel(givenLevel || 'mandatory');
    this.levels.show(uri, this.graph, template);
    this.lockFooterButton();
    this.graph.onChange = () => {
      this.unlockFooterButton();
    };
  },
  conditionalHide() {
    if (!this.graph.isChanged() && !this.etChooser.isModified()) {
      this.hide();
      return;
    }
    const dialogs = registry.get('dialogs');
    const dialogOptions = [{ name: 'keepEditing', buttonLabel: this.keepOption }, {
      name: 'save',
      buttonLabel: this.saveChanges,
      primary: true,
    }, { name: 'discard', buttonLabel: this.discardOption }];
    dialogs.options(this.discardWarning, dialogOptions).then((option) => {
      switch (option) {
        case 'keepEditing':
          break;
        case 'save':
          this.footerButtonClick();
          break;
        case 'discard':
          this.hide();
          break;
        default:
      }
    });
  },

  /**
   * Provided so subclasses can overrride and discard certain errors, e.g. in a create situation.
   * @returns {*}
   */
  getReport() {
    return validate.bindingReport(this.editor.binding);
  },

  isFormOk() {
    const report = this.getReport();
    if (report.errors.length > 0) {
      let hasFew = false;
      let hasMany = false;
      report.errors.forEach((err) => {
        switch (err.code) {
          case engine.CODES.TOO_FEW_VALUES:
            hasFew = true;
            break;
          case engine.CODES.TOO_MANY_VALUES:
          case engine.CODES.TOO_MANY_VALUES_DISJOINT:
            hasMany = true;
            break;
          default:
        }
      });
      this.editor.report(report);
      if (hasFew && !hasMany) {
        return this.tooFewFields;
      } else if (hasMany && !hasFew) {
        return this.tooManyFields;
      }
      return this.tooFewOrTooManyFields;
    }
    return true;
  },

  doneAction() {
    // Override
  },

  footerButtonAction() {
    const formStatus = this.isFormOk();
    if (formStatus !== true) {
      return Promise.reject(formStatus);
    }
    if (this.etChooser.isModified()) {
      return this.etChooser.save().then(() => this.doneAction(this.graph));
    }
    return this.doneAction(this.graph);
  },
});
