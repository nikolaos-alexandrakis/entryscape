import jquery from 'jquery';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import DOMUtil from '../util/htmlUtil';
import template from './DropdownMenuTemplate.html';
import './menu.css';

jquery(document).on('show.bs.dropdown', '.dropdown', function () {
  // calculate the required sizes, spaces
  const $ul = jquery(this).children('.dropdown-menu');
  const menuHeight = $ul.height();
  const buttonHeight = jquery(this).children('.dropdown-toggle').height();
  const scrollHeight = $ul.parent().offsetParent().height();
  const menuAnchorTop = $ul.parent().position().top + buttonHeight;

  // how much space would be left on the top if the dropdown opened that direction
  const spaceUp = (menuAnchorTop - buttonHeight - menuHeight);
  // how much space is left at the bottom
  const spaceDown = scrollHeight - (menuAnchorTop + menuHeight);
  // switch to dropup only if there is no space at the bottom AND there is space at the top,
  // or there isn't either but it would be still better fit
  if (spaceDown < 0 && (spaceUp >= 0 || spaceUp > spaceDown)) { jquery(this).addClass('dropup'); }
}).on('hidden.bs.dropdown', '.dropdown', function () {
  // always reset after close
  jquery(this).removeClass('dropup');
});

export default declare([_WidgetBase, _TemplatedMixin], {
  templateString: template,
  items: null,
  labelHeight: false,
  inHeader: false, // where is the dropdown placed
  postCreate() {
    if (this.labelHeight === true) {
      this.domNode.classList.add('labelHeight');
    }
    if (this.inHeader) {
      this.dropdownButtonNode.classList.add('btn-raised');
    }
    jquery(this.dropdownButtonNode).dropdown();
    this.items = {};
    this.inherited(arguments);
  },
  addItems(params) {
    params.forEach(this.addItem.bind(this));
  },
  addItem(param) {
    const li = DOMUtil.create('li', {class: 'dropdown-item'}, this.dropdownMenuNode);
    const a = DOMUtil.create('a', null, li);
    let cls;
    if (param.iconType === 'fa') {
      cls = `fa fa-fw fa-${param.icon}`;
    } else { // Default is glyphicons
      cls = `glyphicon glyphicon-${param.icon}`;
    }
    const i = DOMUtil.create('i', null, a);
    DOMUtil.addClass(i, cls);
    const label = DOMUtil.create('span', null, a);
    a.onclick = function (ev) {
      ev.stopPropagation();
      jquery(this.dropdownButtonNode).dropdown('toggle');
      param.method();
    }.bind(this);
    this.items[param.name] = { param, elementItem: li, elementLink: a, elementLabel: label };
  },
  updateLocaleStrings(generic, specific) {
    Object.keys(this.items).forEach((name) => {
      const obj = this.items[name];
      const labelKey = obj.param.nlsKey;
      const label = specific != null && specific[labelKey] != null ? specific[labelKey] : generic[labelKey] || '';
      obj.elementLabel.innerHTML = `&nbsp;&nbsp;${label}`;
      const titleKey = obj.param.nlsKeyTitle;
      const title = specific != null && specific[titleKey] != null ? specific[titleKey] : generic[titleKey] || '';
      obj.elementItem.setAttribute('title', title);
    });
  },
  removeItems() {
    this.dropdownMenuNode.innerHTML = '';
  },
  enforceLimits(limit, searchTerm) {
    Object.keys(this.items).forEach((name) => {
      const iconf = this.items[name];
      const maxLimit = iconf.param.max;
      if (iconf.param.disableOnSearch && searchTerm != null && searchTerm.length > 0) {
        iconf.elementLink.setAttribute('disabled', 'disabled');
      } else if (parseInt(maxLimit, 10) === maxLimit && maxLimit <= limit && maxLimit !== -1) {
        iconf.elementLink.setAttribute('disabled', 'disabled');
      } else {
        iconf.elementLink.removeAttribute('disabled');
      }
    });
  },
});
