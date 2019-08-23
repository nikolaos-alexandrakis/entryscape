import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import TitleDialog from 'commons/dialog/TitleDialog';
import eswoConfigureEntityTypes from 'workbench/nls/eswoConfigureEntityTypes.nls';
import { NLSMixin } from 'esi18n';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import config from 'config';
import entitytypes from '../utils/entitytypes';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin, NLSMixin.Dijit], {
  bid: 'eswoConfigureEntityTypes',
  templateString: '<div data-dojo-attach-point="__entitytypeList" class="entityTypeList"></div>',
  maxWidth: 800,
  nlsBundles: [{ eswoConfigureEntityTypes }],
  nlsHeaderTitle: 'entityTypesHeader',
  nlsFooterButtonLabel: 'entityTypesFooter',
  items: null,
  configuredEntitytypes: [],
  oldCEntitytypes: [],

  open(params) {
    this.render();
    this.entry = params.row.entry;
    this.update();
    this.dialog.closeErrorMessage();
    this.dialog.lockFooterButton();
    this.dialog.show();
  },
  footerButtonAction() {
    const entryInfo = this.entry.getEntryInfo();
    const graph = entryInfo.getGraph();
    graph.findAndRemove(this.entry.getResourceURI(), 'esterms:entityType');
    if (this.entitytypeCheckboxes.length !== this.configuredEntitytypes.length) {
      (this.configuredEntitytypes || []).forEach((cEntitytype) => {
        if (cEntitytype.indexOf('http') === 0) {
          graph.add(this.entry.getResourceURI(), 'esterms:entityType', cEntitytype);
        } else {
          graph.addL(this.entry.getResourceURI(), 'esterms:entityType', cEntitytype);
        }
      }, this);
    }
    return entryInfo.commit();
  },
  update() {
    this.configuredEntitytypes = [];
    this.oldCEntitytypes = [];
    const entryInfo = this.entry.getEntryInfo();
    const graph = entryInfo.getGraph();
    const ets = graph.find(this.entry.getResourceURI(), 'esterms:entityType');
    if (ets && ets.length > 0) {
      this.entitytypeCheckboxes.forEach((entitytypeCheckbox) => {
        entitytypeCheckbox.entityEl.removeAttribute('checked');
      });
      ets.forEach((entitytype) => {
        const et = entitytype.getValue();
        this.configuredEntitytypes.push(et);
        this.oldCEntitytypes.push(et);
        this.check(et);
      });
    } else {
      this.entitytypeCheckboxes.forEach((entitytypeCheckbox) => {
        this.configuredEntitytypes.push(entitytypeCheckbox.entitytypeURI);
        this.oldCEntitytypes.push(entitytypeCheckbox.entitytypeURI);
        entitytypeCheckbox.entityEl.setAttribute('checked', true);
      });
    }
  },
  getEntityURI(entitytypename) {
    const es = registry.get('entrystore');
    if (entitytypename.indexOf(es.getBaseURI()) === -1) {
      return es.getResourceURI('entitytypes', entitytypename);
    }
    return entitytypename;
  },
  check(etURI) {
    this.entitytypeCheckboxes.forEach((entitytypeCheckbox) => {
      if (entitytypeCheckbox.entitytypeURI === etURI) {
        entitytypeCheckbox.entityEl.setAttribute('checked', true);
      }
    });
  },
  render() {
    this.entitytypeCheckboxes = [];
    this.__entitytypeList.innerHTML = '';
    const filteredEtypes = entitytypes.filterEntitypeConfigurations(config.entitytypes);
    const sortedEntitytypes = entitytypes.sort(filteredEtypes);
    sortedEntitytypes.forEach((entitytype) => {
      const divPanel = htmlUtil.create('div', { class: 'switch' }, this.__entitytypeList);
      const label = htmlUtil.create('label', null, divPanel);
      const input = htmlUtil.create('input', { type: 'checkbox' }, label);
      const task = htmlUtil.create('span', {
        style: 'color: #333;',
        innerHTML: registry.get('localize')(entitytype.label),
      }, label);
      const etURI = this.getEntityURI(entitytype.name);
      this.entitytypeCheckboxes.push({
        entityEl: input,
        entityNameEl: task,
        entitytypeURI: etURI,
      });
      const updateConfiguredEntitytypes = this.setInModel.bind(this, etURI);
      input.addEventListener('click', updateConfiguredEntitytypes);
    });
  },

  setInModel(etURI, event) {
    this.dialog.closeErrorMessage();
    const target = event.target || event.srcElement;
    if (target.checked) {
      this.configuredEntitytypes.push(etURI);
    } else {
      this.configuredEntitytypes.splice(this.configuredEntitytypes.indexOf(etURI), 1);
    }

    if (JSON.stringify(this.oldCEntitytypes) === JSON.stringify(this.configuredEntitytypes)) {
      this.dialog.lockFooterButton();
    } else {
      if (this.configuredEntitytypes.length === 0) {
        // show error message
        this.dialog.showErrorMessage(this.NLSLocalized0.errorMessage);
        this.dialog.lockFooterButton();
        return;
      }
      this.dialog.unlockFooterButton();
    }
  },
});
