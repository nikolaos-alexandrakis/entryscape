import { clone, template as renderTemplate } from 'lodash-es';
import dateUtil from 'commons/util/dateUtil';
import DOMUtil from '../util/htmlUtil';
import registry from '../registry';
import templateString from './EntryRowTemplate.html';
import DropdownMenu from '../menu/DropdownMenu';

import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';

export default  declare([_WidgetBase, _TemplatedMixin], {
  templateString,
  entry: null,
  showCol0: false,
  showCol1: false,
  showCol3: true,
  showCol4: true,
  // true forces menu, false disallows menu, otherwise nr. of buttons will decide (> 1 -> menu)
  rowButtonMenu: null,
  nlsDateTitle: 'modifiedDateTitle',

  constructor() {
    this.buttons = {};
  },
  postCreate() {
    this.inherited('postCreate', arguments);
    if (this.showCol0) {
      this.rowNode.classList.remove('col0hidden');
    }
    if (this.showCol1) {
      this.rowNode.classList.remove('col1hidden');
    }
    if (this.showCol3) {
      this.rowNode.classList.remove('col3hidden');
    }
    if (this.nlsGenericBundle) {
      this.updateLocaleStrings(this.nlsGenericBundle, this.nlsSpecificBundle);
    }
    if (!this.showCol4) {
      this.rowNode.classList.add('col4hidden');
    } else {
      this.updateActions();
    }
  },

  updateLocaleStrings(generic, specific) {
    this.nlsGenericBundle = generic;
    this.nlsSpecificBundle = specific;
    // 18thMar2016 if dropdown menu enabled,build localized strings for dropdown menu items
    if (this.dropdownMenu) {
      this.dropdownMenu.updateLocaleStrings(generic, specific);
    }

    Object.keys(this.buttons).forEach((name) => {
      const params = this.buttons[name];
      if (params.params.nlsKeyTitle) {
        params.element.setAttribute('title', (specific && specific[params.params.nlsKeyTitle])
          || generic[params.params.nlsKeyTitle] || '');
      }
    }, this);

    this.render();
  },

  isRowClick(ev) {
    return this.rowNode.contains(ev.target);
  },

  reRender() {
    if (this.showCol4) {
      this.updateActions();
    }
    if (this.nlsGenericBundle) {
      this.updateLocaleStrings(this.nlsGenericBundle, this.nlsSpecificBundle);
    }
  },

  updateActions() {
    // delete any existing actions
    this.buttonsNode.innerHTML = '';

    // 18thMar2016 if dropdown menu enabled,construct dropdown menu with info,edit,removebuttons
    const rowButtons = this.list.getRowActions();
    let buttonPotentiallyInMenu = 0;
    for (let i = 0; i < rowButtons.length; i++) {
      if (rowButtons[i].noMenu !== true) {
        buttonPotentiallyInMenu += 1;
      }
    }
    if (this.rowButtonMenu === true ||
      (buttonPotentiallyInMenu > 1 && this.rowButtonMenu !== false)) {
      this.dropdownMenu = new DropdownMenu({}, DOMUtil.create('button', null, this.buttonsNode));
      this.dropdownMenu.domNode.classList.add('pull-right');
      rowButtons.forEach(this.installMenuItem.bind(this));
    } else {
      rowButtons.forEach(this.installButton.bind(this));
    }
  },

  /**
   * @deprecated use corresponding method installActionOrNot.
   */
  installButtonOrNot(params) {
    return this.list.installActionOrNot(params, this);
  },
  installActionOrNot(params) {
    return this.list.installActionOrNot(params, this);
  },
  // 18thMar2016 creating dropdown menu items
  installMenuItem(paramsParams) {
    // 18thMar2016 check button is enabled as dropdown menu item or not
    const params = clone(paramsParams);
    if (params.noMenu) {
      this.installButton(params);
    } else {
      const access = this.installActionOrNot(params);
      if (access === false) {
        return;
      }
      if (params.method && typeof this[params.method] === 'function') {
        params.method = params.method.bind(this);
      } else if (typeof this[`action_${params.name}`] === 'function') {
        params.method = this[`action_${params.name}`].bind(this);
      } else {
        params.method = this.list.openDialog.bind(this.list, params.name, {row: this});
      }
      if (access !== 'disabled') this.dropdownMenu.addItem(params);
    }
  },
  installButton(params) {
    const access = this.installButtonOrNot(params);
    if (access === false) {
      return;
    }
    const el = DOMUtil.create('button', {
        type: 'button',
        title: params.title || '',
      }, this.buttonsNode,
      params.first === true ? true : false);
    el.classList.add(`btn`);
    el.classList.add(`btn-sm`);
    el.classList.add(`btn-${params.button}`);

    let cls;
    if (params.iconType === 'fa') {
      cls = `fa fa-fw fa-${params.icon}`;
    } else { // Default is glyphicons
      cls = `glyphicon glyphicon-${params.icon}`;
    }

    const span = DOMUtil.create('span', {
      'aria-hidden': true,
    }, el);
    DOMUtil.addClass(span, cls);

    this.buttons[params.name] = {params, element: el};
    if (access === 'disabled') {
      el.classList.add('disabled');
    } else {
      el.onclick = function (ev) {
        ev.stopPropagation();
        if (params.method && typeof this[params.method] === 'function') {
          this[params.method]();
        } else if (typeof this[`action_${params.name}`] === 'function') {
          this[`action_${params.name}`]();
        } else {
          this.list.openDialog(params.name, {row: this});
        }
      }.bind(this);
    }
  },
  render() {
    if (this.showCol1) {
      this.renderCol1();
    }

    const name = this.getRenderNameHTML();
    if (typeof name === 'string') {
      this.nameNode.innerHTML = name;
    } else if (typeof name === 'object' && typeof name.then === 'function') {
      name.then(function (nameStr) {
        this.nameNode.innerHTML = nameStr;
      }.bind(this));
    }
    if (this.showCol3) {
      this.renderCol3();
    }
  },

  getRowClickLink() {
    // Override
  },

  getRenderNameHTML() {
    const name = this.getRenderName();
    const href = this.getRowClickLink() || this.list.getRowClickLink(this);
    if (href) {
      return `<a href="${href}">${name}</a>`;
    }
    return name;
  },

  getRenderName() {
    const rdfutils = registry.get('rdfutils');
    return rdfutils.getLabel(this.entry);
  },

  renderCol1() {
  },

  renderCol3() {
    this.renderDate();
  },
  renderDate() {
    if (this.nlsGenericBundle) { // Localization strings are loaded.
      try {
        const modDate = this.getDate();
        const mDateFormats = dateUtil.getMultipleDateFormats(modDate);
        const dateTitle = this.nlsSpecificBundle[this.nlsDateTitle] ||
          this.nlsGenericBundle[this.nlsDateTitle] || '';
        const tStr = renderTemplate(dateTitle)({ date: mDateFormats.full });
        this.col3Node.innerHTML = mDateFormats.short;
        this.col3Node.setAttribute('title', tStr);
      } catch (e) {
        // TODO strange case when gregorian has not been loaded in time.
      }
    }
  },
  getDate() {
    return this.entry.getEntryInfo().getModificationDate();
  },
  updateCheckBox(select) {
    select ? this.checkboxNode.checked = true : this.checkboxNode.checked = false;
  },
  showCheckboxColumn() {
    this.showCol0 = true;
    if (this.showCol0) {
      this.rowNode.classList.remove('col0hidden');
    }
  },
  isChecked() {
    // return domProp.get(this.checkboxNode, 'checked');
    return this.checkboxNode.checked;
  },
  getCheckbox() {
    return this.checkboxNode;
  },
});
