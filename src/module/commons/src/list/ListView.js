import registry from 'commons/registry';
import uiUtil from 'commons/util/uiUtil';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import jquery from 'jquery';
import m from 'mithril';
import PubSub from 'pubsub-js';
import DropdownMenu from '../menu/DropdownMenu';
import DOMUtil from '../util/htmlUtil';

import ResultSize from './components/ResultSize';
import template from './ListViewTemplate.html';

export default declare([_WidgetBase, _TemplatedMixin], {
  templateString: template,
  list: null,
  includeSortOptions: true,
  includeHead: true,
  includeHeadBlock: true,
  includeHeader: false,
  includeResultSize: true,
  searchVisibleFromStart: true,
  includeExpandButton: true,
  searchInList: true,
  rowClickDialog: null,
  sortOrder: 'mod',
  nlsGenericBundle: null,
  nlsListHeaderKey: 'listHeader',
  nlsListHeaderTitleKey: 'listHeaderTitle',
  nlsListResultSizeKey: 'listResultSizeText',
  nlsTypeaheadPlaceholderKey: 'typeaheadPlaceholder',
  listSearchPlaceholderKey: 'listSearchPlaceholder',
  placeHolderClass: null,
  buttonMenu: null, // true forces menu, false disallows menu, otherwise nr.of buttons will decide

  postCreate() {
    this.inherited('postCreate', arguments);
    this.listSize = 0;
    this.rows = [];
    this.newRows = [];
    this.buttons = {};
    const buttons = this.list.getListActions();

    if (this.includeHead) {
      this.head.style.display = '';
    }

    if (this.includeHeadBlock) {
      this.headBlock.style.display = '';
    }

    if (!this.includeHeader) {
      this.headerContainerInner.style.display = 'none';
      this.headerContainer.insertBefore(this.searchBlockInner, this.headerContainerInner);
    }
    if (this.searchVisibleFromStart && this.searchInList === true) {
      this.expandButtonIcon.classList.toggle('fa-chevron-right');
      this.expandButtonIcon.classList.toggle('fa-chevron-down');
    }
    if (this.includeExpandButton && this.searchInList === true) {
      this.expandButton.style.display = '';
    }

    if (buttons.length > 0) {
      // If forced or more than two buttons allowed in menu and button menu
      // not explicitly disallowed, construct dropdown menu with buttons
      let buttonPotentiallyInMenu = 0;
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].noMenu !== true) {
          buttonPotentiallyInMenu += 1;
        }
      }
      if (this.buttonMenu === true ||
        (buttonPotentiallyInMenu > 2 && this.buttonMenu !== false)) {
        this.dropdownMenu = new DropdownMenu({
          labelHeight: true,
          inHeader: true,
        }, DOMUtil.create('button', null, this.buttonContainer));
        this.dropdownMenu.domNode.classList.add('pull-right');
        buttons.forEach(this.installMenuItem.bind(this));
      } else {
        buttons.forEach(this.installButton.bind(this));
      }
      this.headerContainer.classList.remove('col-md-12');
      this.buttonContainer.classList.add('col-md-12');
      this.buttonContainer.style.display = '';
      if (buttons.length > 1) {
        if (this.includeResultSize) {
          DOMUtil.addClass(this.headerContainer, 'col-md-5 col-sm-6');

          DOMUtil.addClass(this.resultSizeContainer, 'col-md-1 col-sm-1');
        } else {
          DOMUtil.addClass(this.headerContainer, 'col-md-5 col-sm-7');
        }
      } else if (this.includeResultSize) {
        DOMUtil.addClass(this.headerContainer, 'col-md-5 col-sm-6');
        DOMUtil.addClass(this.resultSizeContainer, 'col-md-1 col-sm-1');
      } else {
        DOMUtil.addClass(this.headerContainer, 'col-md-5 col-sm-8');
      }
    }

    if (this.includeSortOptions === true) {
      this.sortBlock.style.display = '';
      this.sortOrderModNode.onclick = function () {
        if (this.sortOrder !== 'mod') {
          this.sortOrder = 'mod';
          this.action_refresh();
          this.sortOrderModNode.classList.toggle('active');
          this.sortOrderTitleNode.classList.toggle('active');
        }
      }.bind(this);

      this.sortOrderTitleNode.onclick = function () {
        if (this.sortOrder !== 'title') {
          this.sortOrder = 'title';
          this.action_refresh();
          this.sortOrderModNode.classList.toggle('active');
          this.sortOrderTitleNode.classList.toggle('active');
        }
      }.bind(this);
    }

    if (this.searchInList) {
      let t;
      const searchTriggered = this.action_refresh.bind(this);
      this.searchTermNode.onkeyup = () => {
        if (t != null) {
          clearTimeout(t);
        }
        t = setTimeout(searchTriggered, 300);
      };
    }

    this.expandButton.onclick = function () {
      if (this.searchBlock.style.display === 'none') {
        jquery(this.searchBlock).slideDown(300);
      } else {
        jquery(this.searchBlock).slideUp(300);
      }
      this.expandButtonIcon.classList.toggle('fa-chevron-right');
      this.expandButtonIcon.classList.toggle('fa-chevron-down');
    }.bind(this);
    if (this.rowClickDialog != null) {
      this.domNode.classList.add('rowClickEnabled');
    }
    if (this.includeMassOperations === true) {
      this.domNode.classList.add('escoMassOperations');
      this.selectallCheck.onclick = function (event) {
        const target = event.target || event.srcElement;
        if (target.checked) {
          this.btnAll.style.display = 'inline';
        } else {
          this.btnAll.style.display = 'none';
        }
        this.rows.forEach((row) => {
          row.updateCheckBox(target.checked);
        });
        this.newRows.forEach((row) => {
          row.updateCheckBox(target.checked);
        });
      }.bind(this);
    } else {
      this.massOperationsNode.style.display = 'none';
    }
  },

  getSize() {
    return this.listSize;
  },
  getActualSize() {
    return this.actualListSize;
  },
  /**
   * Return actualListSize if actualListSize  !== =1 or listSize
   */
  getResultSize() {
    if (this.getActualSize() === -1) {
      return this.getSize();
    }

    return this.getActualSize();
  },

  getPageCount() {
    return this.pageCount;
  },

  getCurrentPage() {
    return this.currentPage;
  },

  /**
   * Bundle assumed to have the following localized strings:
   * listHeader - the header of the list.
   * createPopoverTitle - the title of a popover shown when hovering over the create button
   * createPopoverMessage - the content of a popover shown when hovering over the create button
   * createButtonLabel - the label of the create button
   *
   * @param bundle
   */
  updateLocaleStrings(generic, specific) {
    this.nlsGenericBundle = generic;
    this.nlsSpecificBundle = specific;
    this.localePromise = Promise.resolve({ g: generic, s: specific });

    // List header
    this.updateHeader();
    this.searchTermNode.setAttribute('placeholder',
      (specific && specific[this.listSearchPlaceholderKey]) || generic[this.listSearchPlaceholderKey] || '');
    this.searchTermNode.setAttribute('title', generic.listSearchTitle || '');
    this.tooShortSearch.innerHTML = generic.listSearchTitle || '';
    this.invalidSearch.innerHTML = generic.invalidSearchMessage || '';
    this.sortOptionsLabel.innerHTML = generic.sortOptionsLabel;
    this.sortOrderTitleCheck.innerHTML = generic.titleSortLabel;
    this.sortOrderDateCheck.innerHTML = generic.dateSortLabel;
    this.selectallLabel.innerHTML = generic.selectAllLabel;
    this.typeaheadInput.setAttribute('placeholder',
      (specific && specific[this.nlsTypeaheadPlaceholderKey]) || generic[this.nlsTypeaheadPlaceholderKey] || '');

    this.rows.forEach((row) => {
      row.updateLocaleStrings(generic, specific);
    });
    this.newRows.forEach((row) => {
      row.updateLocaleStrings(generic, specific);
    });

    // if dropdown menu enabled,build localized strings for dropdown menu items
    if (this.buttonMenu) {
      this.dropdownMenu.updateLocaleStrings(generic, specific);
    }
    let mesg;
    Object.keys(this.buttons).forEach((name) => {
      const params = this.buttons[name];
      if (params.params.nlsKey) {
        params.label.innerHTML =
          `&nbsp;${(specific && specific[params.params.nlsKey]) || generic[params.params.nlsKey] || ''}`;
      }
      const popoverOptions = uiUtil.getPopoverOptions();
      mesg = null;
      if (params.params.nlsKeyMessage && params.params.nlsKeyMessage !== '') {
        mesg = (specific && specific[params.params.nlsKeyMessage])
          || generic[params.params.nlsKeyMessage];
      }

      if (mesg != null) {
        popoverOptions.content = mesg;
        jquery(params.element).popover(popoverOptions);
      } else {
        jquery(params.element).popover('destroy');
        if (params.params.nlsKeyTitle) {
          params.element.setAttribute('title',
            (specific && specific[params.params.nlsKeyTitle]) ||
            generic[params.params.nlsKeyTitle] || '');
        }
      }
    });
  },

  updateHeader() {
    const lhk = this.nlsListHeaderKey;
    const lhtk = this.nlsListHeaderTitleKey;
    this.listHeader.innerHTML =
      (this.nlsSpecificBundle && this.nlsSpecificBundle[lhk])
      || this.nlsGenericBundle[lhk] || '';
    this.listHeader.setAttribute('title',
      (this.nlsSpecificBundle && this.nlsSpecificBundle[lhtk])
      || this.nlsGenericBundle[lhtk] || '');
  },

  installButton(params) {
    const el = DOMUtil.create('button', {
      type: 'button',
    }, this.buttonContainer, params.first === true);
    DOMUtil.addClass(el, `pull-right btn btn-raised btn-${params.button}`);

    const span = DOMUtil.create('span', { 'aria-hidden': true }, el);
    DOMUtil.addClass(span, `fa fa-${params.icon}`);

    const label = DOMUtil.create('span', null, el);
    label.classList.add('escoList__buttonLabel');
    this.buttons[params.name] = { params, element: el, label };
    if (params.method && typeof this[params.method] === 'function') {
      el.onclick = params.method.bind(this);
    } else if (typeof this[`action_${params.name}`] === 'function') {
      el.onclick = this[`action_${params.name}`].bind(this);
    } else {
      el.onclick = this.list.openDialog.bind(this.list, params.name, {});
    }
  },
  installMenuItem(params) {
    if (params.noMenu) {
      this.installButton(params);
    } else {
      if (params.method && typeof this[params.method] === 'function') {
        params.method = params.method.bind(this);
      } else if (typeof this[`action_${params.name}`] === 'function') {
        params.method = this[`action_${params.name}`].bind(this);
      } else {
        params.method = this.list.openDialog.bind(this.list, params.name, {});
      }
      this.dropdownMenu.addItem(params);
    }
  },
  showPlaceholder(searchMode) {
    // hide hearder part
    // TODO find more elegant way to check if list header should be shown than
    // the very specific check specific to catalog/responsibles sharedControlLabel
    // This is a hotfix.
    if (searchMode || !this.searchInList || this.list.sharedControlLabel != null) {
      this.listHeaderS.style.display = '';
    } else {
      this.listHeaderS.style.display = 'none';
    }
    if (!this.dPlaceholder) {
      if (!this.dPlaceholderInProgress) {
        this.dPlaceholderInProgress = true;
        const Cls = this.placeholderClass;

        this.localePromise.then(() => {
          delete this.dPlaceholderInProgress;
          this.dPlaceholder = new Cls({
            search: false,
            list: this.list,
          }, DOMUtil.create('div', null, this.__placeholder));
          this.dPlaceholder.show(searchMode);
        });
      }
    } else {
      this.dPlaceholder.show(searchMode);
    }
  },
  hidePlaceholder() {
    this.listHeaderS.style.display = '';
    if (this.dPlaceholder) {
      this.dPlaceholder.hide();
    }
  },

  /**
   * @param {store/List} entryList
   */
  showEntryList(entryList) {
    this.entryList = entryList;
    this.pageCount = -1;
    this.actualListSize = -1;
    this.showPage(1);
  },
  setTableHead(rowHTML) {
    this.tableHeading.innerHTML = rowHTML;
  },

  /**
   * Renders the ResultSize component in the footer of the list table.
   */
  showResultSize() {
    this.localePromise.then(() => {
      const bundle = this.nlsSpecificBundle.nlsListResultSizeKey ?
        this.nlsSpecificBundle : this.nlsGenericBundle;
      const tStr = i18n.renderNLSTemplate(bundle[this.nlsListResultSizeKey], this.getResultSize());

      m.render(this.resultSizeContainer,
        m(ResultSize, { text: tStr }));
    });
  },

  showPage(page) {
    if (page < 1 || (page !== 1 && this.pageCount !== -1 && page > this.pageCount)) {
      return undefined;
    }
    this.currentPage = page;
    return this.entryList.getEntries(page - 1).then((entryArr) => {
      if (entryArr.length === 0 && page > 1) {
        this.emptyPage = true;
        this.showPage(page - 1);
        return;
      }
      this._clearRows(this.rows);
      this._clearRows(this.newRows);
      if (entryArr.length === 0 && this.placeholderClass != null) {
        this.showPlaceholder(this.searchTerm != null && this.searchTerm !== '');
        if (this.includeMassOperations === true) {
          this.selectallCheck.setAttribute('disabled', 'disabled');
          this.selectAll.style.cursor = 'not-allowed';
        }
      } else {
        this.hidePlaceholder();
      }
      this._checkSize(entryArr);
      this._calculatePageCount(entryArr);
      entryArr.forEach(this._renderRow, this);
      this._updatePagination();
      if (this.includeResultSize && (this.searchTerm != null && this.searchTerm.length !== 0)) {
        this.resultSizeContainer.style.display = 'block';
        this.showResultSize();
      } else {
        this.resultSizeContainer.style.display = 'none';
      }
      this.doneRenderingPage();
    });
  },
  doneRenderingPage() {
  },
  removeRow(row) {
    this.listSize -= 1;
    this.actualListSize = -1;
    let idx = this.rows.indexOf(row);
    if (idx >= 0) {
      this.rows.splice(idx, 1);
    } else {
      idx = this.newRows.indexOf(row);
      if (idx >= 0) {
        this.newRows.splice(idx, 1);
      }
    }
    if (this.listSize === 0) {
      this.showPlaceholder(false);
      if (this.includeMassOperations === true) {
        this.selectallCheck.setAttribute('disabled', 'disabled');
        this.selectAll.style.cursor = 'not-allowed';
      }
    }
    this._enforceLimits();
    if (this.includeResultSize) {
      this.showResultSize();
    }
  },
  addRowForEntry(entry) {
    this.listSize += 1;
    this.actualListSize = -1;
    this._enforceLimits();
    if (this.listSize > 0) {
      this.hidePlaceholder();
      if (this.includeMassOperations === true) {
        this.selectallCheck.removeAttribute('disabled');
        this.selectAll.style.cursor = 'pointer';
      }
    }
    this.selectallCheck.checked = false;
    const row = this._renderRow(entry, true);
    if (this.includeResultSize) {
      this.showResultSize();
    }
    return row;
  },
  _clearRows(rows) {
    if (rows != null && rows.length > 0) {
      rows.forEach((row) => {
        row.destroy();
      });
      rows.splice(0, rows.length);
    }
  },
  _checkSize(arr) {
    this.listSize = this.entryList.getSize();
    if (arr.length < this.entryList.getLimit()
      || (arr.length === this.entryList.getLimit() && this.emptyPage)) {
      this.actualListSize = ((this.currentPage - 1) * this.entryList.getLimit()) + arr.length;
    }
    this.emptyPage = false;
    if (this.actualListSize >= 0) {
      this.listSize = this.actualListSize;
    }
    this._enforceLimits();
    PubSub.publish('catalog/updateListCount', this.listSize);
  },
  _enforceLimits() {
    if (this.buttonMenu) {
      this.dropdownMenu.enforceLimits(this.listSize, this.searchTerm);
    } else {
      Object.keys(this.buttons).forEach((name) => {
        const bconf = this.buttons[name];
        const maxLimit = bconf.params.max;
        if (bconf.params.disableOnSearch && this.searchTerm != null
          && this.searchTerm.length > 0) {
          bconf.element.setAttribute('disabled', 'disabled');
        } else if (parseInt(maxLimit, 10) === maxLimit && maxLimit !== -1 &&
          maxLimit <= this.listSize) {
          bconf.element.setAttribute('disabled', 'disabled');
        } else {
          bconf.element.removeAttribute('disabled');
        }
      });
    }
  },
  _calculatePageCount(arr) {
    this.pageCount = Math.ceil(this.listSize / this.entryList.getLimit());
    if (this.pageCount > 1 || (arr.length === 0 && this.currentPage > 1)) {
      this.domNode.classList.add('multiplePages');
    } else {
      this.domNode.classList.remove('multiplePages');
    }

    return this.pageCount;
  },

  _renderRow(entry, newRow) {
    let node;
    if (newRow === true) {
      node = DOMUtil.create('div', null, this.tableHeading);
    } else {
      node = DOMUtil.create('div', null, this.rowListNode);
    }

    const Cls = this.rowClass;
    const row = new Cls({ list: this.list, entry }, node);
    if (newRow === true) {
      const rowBackgroundColor = row.domNode.style.background;
      jquery(row.domNode).css({ backgroundColor: 'yellow' });
      jquery(row.domNode).animate(
        {
          backgroundColor: rowBackgroundColor,
        },
        2500,
        () => {
          row.domNode.style.background = '';
        },
      );
    }
    if (this.nlsGenericBundle) {
      row.updateLocaleStrings(this.nlsGenericBundle, this.nlsSpecificBundle);
    }
    if (newRow === true) {
      this.newRows.push(row);
    } else {
      this.rows.push(row);
    }
    if (this.rowClickDialog != null) {
      row.domNode.onclick = function (ev) {
        // Check if click should not trigger rowclick
        if (typeof row.isRowClick === 'function' && !row.isRowClick(ev)) {
          return;
        }
        // Check so click is not to disable a menu...
        if (ev.target.classList.contains('dropdown-backdrop') || ev.target.classList.contains('check')) {
          return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        if (typeof row[`action_${this.rowClickDialog}`] === 'function') {
          row[`action_${this.rowClickDialog}`]({ row });
        } else {
          this.list.openDialog(this.rowClickDialog, { row });
        }
      }.bind(this);
    }
    if (this.includeMassOperations === true) {
      row.showCheckboxColumn();
      row.getCheckbox().onclick = function (ev) {
        ev.stopPropagation();
        const totalRows = this.rows.concat(this.newRows);
        const checkedRows = [];
        totalRows.forEach((r) => {
          if (r.isChecked()) {
            checkedRows.push(r);
          }
        });
        if (checkedRows.length === totalRows.length) {
          this.selectallCheck.checked = true;
        } else {
          this.selectallCheck.checked = false;
        }
        if (checkedRows.length > 0) {
          this.btnAll.style.display = 'inline';
        } else {
          this.btnAll.style.display = 'none';
        }
      }.bind(this);
    }
    return row;
  },
  _updatePagination() {
    let li;
    let a;
    if (this._pageNodes) {
      this._pageNodes.forEach((pageNode) => {
        pageNode.parentNode.removeChild(pageNode);
      });
    }
    this._pageNodes = [];

    let i = 1;
    const end = this.pageCount > this.currentPage + 3 ? this.currentPage + 3 : this.pageCount;
    if (this.currentPage > 4) {
      i = this.currentPage - 3;
      li = DOMUtil.create('li', null, this.paginationList, this.paginationNextLi);
      this._pageNodes.push(li);
      a = DOMUtil.create('span', null, li);
      a.innerHTML = '&hellip;';
    }
    for (; i <= end; i++) {
      li = DOMUtil.create('li', null, this.paginationList, this.paginationNextLi);
      this._pageNodes.push(li);
      a = DOMUtil.create('a', null, li);
      a.innerHTML = `${i}`;

      if (i === this.currentPage) {
        li.classList.add('active');
      } else {
        a.onclick = function (page, evt) {
          evt.preventDefault();
          this.showPage(page);
        }.bind(this, i);
      }
    }
    if (this.pageCount > this.currentPage + 3) {
      li = DOMUtil.create('li', null, this.paginationList, this.paginationNextLi);
      this._pageNodes.push(li);
      a = DOMUtil.create('span', null, li);
      a.innerHTML = '&hellip;';
    }
    if (this.currentPage === 1) {
      this.paginationPreviousLi.classList.add('disabled');
    } else {
      this.paginationPreviousLi.classList.remove('disabled');
    }

    if (this.currentPage === this.pageCount) {
      this.paginationPreviousLi.classList.remove('disabled');
    } else {
      this.paginationNextLi.classList.remove('disabled');
    }

    if (this.nlsGenericBundle) {
      this.paginationPreviousA.setAttribute('title', this.nlsGenericBundle.listPreviousPage);
      this.paginationNextA.setAttribute('title', this.nlsGenericBundle.listNextPage);
    }
  },
  _clickPrevious(evt) {
    evt.preventDefault();
    this.showPage(this.currentPage - 1);
  },

  _clickNext(evt) {
    evt.preventDefault();
    this.showPage(this.currentPage + 1);
  },
  action_refresh() {
    this.searchTerm = this.searchTermNode.value || '';
    this.resultSizeContainer.style.display = 'none';
    this.searchBlockInner.classList.remove('has-error');
    this.searchBlockInner.classList.remove('has-warning');
    this.searchIconFeedback.classList.remove('fa-exclamation-triangle');

    this.tooShortSearch.style.display = 'none';
    this.invalidSearch.style.display = 'none';
    if (/["+~#()]/.test(this.searchTerm)) {
      this.searchBlockInner.classList.add('has-error');
      this.searchIconFeedback.classList.add('fa-exclamation-triangle');
      this.invalidSearch.style.display = '';
    } else if (this.searchTerm.length < 3 && this.searchTerm.length !== 0) {
      this.searchBlockInner.classList.add('has-warning');
      this.searchIconFeedback.classList.add('fa-exclamation-triangle');
      this.tooShortSearch.style.display = '';
    } else {
      this._enforceLimits();
      this.list.search({ sortOrder: this.sortOrder, term: this.searchTerm });
    }
  },
  selectRow(row) {
    this.selectedRow = row;
    row.domNode.classList.add('selectedRow');
  },
  clearSelection() {
    if (this.selectedRow && this.selectedRow.domNode) {
      this.selectedRow.domNode.classList.remove('selectedRow');
    }
    delete this.selectedRow;
  },
  clearSearch() {
    if (this.searchTerm) {
      this.searchTermNode.setAttribute('value', '');
      this.action_refresh();
    }
  },
  clearView() {
    this.searchTermNode.setAttribute('value', '');
    this.searchTerm = '';
    this.searchBlockInner.classList.remove('has-error');
    this.searchBlockInner.classList.remove('has-warning');
    this.searchIconFeedback.classList.remove('fa-exclamation-triangle');
    this.tooShortSearch.style.display = 'none';
    this.invalidSearch.style.display = 'none';
  },
  removeAll() {
    const gb = this.list.nlsGenericBundle;
    const sb = this.list.nlsSpecificBundle;
    const removeConfirmMessage = sb[this.list.nlsRemoveAllEntires] ?
      sb[this.list.nlsRemoveAllEntires] : gb[this.list.nlsRemoveAllEntires];
    const removeFailedMessage = sb[this.list.nlsRemoveFailedKey] ?
      sb[this.list.nlsRemoveFailedKey] : gb[this.list.nlsRemoveFailedKey];
    const dialogs = registry.get('dialogs');
    dialogs.confirm(removeConfirmMessage, null, null,
      (confirm) => {
        if (confirm) {
          // filter only checked rows
          const totalRows = this.rows.concat(this.newRows);
          const checkedRows = [];
          totalRows.forEach((row) => {
            if (row.isChecked()) {
              checkedRows.push(row);
            }
          });
          Promise.all(checkedRows.map(row => row.entry.del())).then(() => {
            this.action_refresh();
            this.btnAll.style.display = 'none';
            this.selectallCheck.checked = false;
          }, () => {
            dialogs.acknowledge(removeFailedMessage);
          }).then(() => {
            this.action_refresh();
          });
        }
      });
  },
});
