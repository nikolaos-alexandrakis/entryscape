import declare from 'dojo/_base/declare';
import jquery from 'jquery';
import DOMUtil from '../../util/htmlUtil';
import EntryRow from '../EntryRow';
import template from './DropdownRowTemplate.html';
import './escoDropdownRow.css';

export default declare([EntryRow], {
  bid: 'escoDropdownRow',
  templateString: template,
  items: null,
  dropdownItems: [],
  showCol1: false,

  buildRendering() {
    this.dropdownItems = [];
    this.inherited(arguments);
  },
  postCreate() {
    this.items = {};
    if (this.dropdownItems.length > 0) {
      this.showCol1 = true;
      jquery(this.dropdownRowMenu).dropdown();
      this.dropdownItems.forEach(this.addItem.bind(this));
      jquery(this.dropdownTest).on('shown.bs.dropdown', () => {
        this.updateDropdown();
      });
    }
    this.inherited(arguments);
  },
  updateDropdown() {

  },
  isDisabled(name) {
    this.items[name].elementItem.classList.contains('disabled');
  },
  disableDropdown() {
    this.dropdownRowMenu.classList.add('disabled');
    this.dropdownIcon.style.visibility = 'hidden';
    this.dropdownIcon.classList.add('escoDropdownRow__menuDisabled');
  },
  /* start */
  setDropdownStatus(menuItem) {
    if (this.items[menuItem]) {
      const menuObj = this.items[menuItem].param;
      let icon = menuObj.icon;
      if (menuObj.iconType === 'fa') {
        icon = `fa fa-${icon}`;
      } else { // Default is glyphicons
        icon = `glyphicon glyphicon-${icon}`;
      }
      this.setDropdownStatusIcon(icon);
    }
  },
  setDropdownTitle(menuItem) {
    if (this.items[menuItem]) {
      const menuObj = this.items[menuItem].param;
      const title = this.list.nlsSpecificBundle[menuObj.nlsKeyTitle];
      this.setDropdownStatusTitle(title);
    }
  },
  /* end */
  /**
   * Clear previous icons in this.statusIcon.classList
   * TODO we assume we are using fontawesome
   * @param icon
   */
  setDropdownStatusIcon(icon) {
    // remove old icons
    const fontAwesomeFilter = cls => cls === 'fa' || cls.startsWith('fa-');
    const toRemoveIconClasses = Array.from(this.statusIcon.classList).filter(fontAwesomeFilter);
    toRemoveIconClasses.forEach(cls => this.statusIcon.classList.remove(cls));

    // add new ones
    DOMUtil.addClass(this.statusIcon, icon);
  },
  setDropdownStatusTitle(title) {
    this.dropdownRowMenu.setAttribute('title', title);
  },
  /**
   * this is useful when you change from one role to other
   * it disables new role and enables all other roles
   * sets title and icon to new role
   */
  changeDropdownStatus(name, title) {
    Object.keys(this.items).forEach((item) => {
      const obj = this.items[item];
      if ((!obj.param.disabled) || (obj.param.disabled && !obj.param.disabled)) {
        obj.elementItem.classList.remove('disabled');
      }
    }, this);
    this.items[name].elementItem.classList.add('disabled');
    // statusIcon
    this.setDropdownStatus(name);
    this.dropdownRowMenu.setAttribute('title', title);
  },
  disableCurrentMenuItem(name) {
    this.items[name].elementItem.classList.add('disabled');
  },
  enableCurrentMenuItem(name) {
    this.items[name].elementItem.classList.remove('disabled');
  },
  addItem(paramParams) {
    const param = paramParams;
    const li = DOMUtil.create('li', null, this.dropdownRowMenuList);
    const a = DOMUtil.create('a', null, li);
    let cls;
    if (param.iconType === 'fa') {
      cls = `fa fa-${param.icon}`;
    } else { // Default is glyphicons
      cls = `glyphicon glyphicon-${param.icon}`;
    }
    cls = `${cls} pull-left escoDropdownRow__menuItemIcon`;

    const italicEl = DOMUtil.create('i', null, a);
    DOMUtil.addClass(italicEl, cls);

    const label = DOMUtil.create('span', null, a);
    label.classList.add('escoDropdownRow__menuItemText');
    if (param.method !== 'undefined' && typeof param.method === 'function') {
      a.onclick = function (ev) {
        ev.stopPropagation();
        jquery(this.dropdownRowMenu).dropdown('toggle');
        param.method();
      }.bind(this);
      param.method = param.method.bind(this);// removed undefined "event"
    }
    this.items[param.name] = { param, elementItem: li, elementLink: a, elementLabel: label };
    if (param.disabled) {
      li.classList.add('disabled');
    }
    li.classList.add('disabled');
  },
  updateLocaleStrings(generic, specific) {
    this.inherited('updateLocaleStrings', arguments);
    Object.keys(this.items).forEach((name) => {
      const obj = this.items[name];
      const labelKey = obj.param.nlsKey;
      const label = specific != null && specific[labelKey] != null ? specific[labelKey] : generic[labelKey] || '';
      obj.elementLabel.innerHTML = `&nbsp;&nbsp;${label}`;
      const titleKey = obj.param.nlsKeyTitle;
      const title = specific != null && specific[titleKey] != null ? specific[titleKey] : generic[titleKey] || '';
      obj.elementItem.setAttribute('title', title);
    }, this);
  },
  removeItems() {
    this.dropdownRowMenu.innerHTML = '';
    this.items = {};
    this.dropdownItems = [];
  },
  registerDropdownItem(params) {
    this.dropdownItems.push(params);
  },
  removeItem(name) {
    const obj = this.items[name];
    obj.elementItem.parentNode.removeChild(obj.elementItem);
    delete this.items[name];
  },
});
