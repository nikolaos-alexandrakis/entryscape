import registry from 'commons/registry';
import config from 'config';
import { i18n } from 'esi18n';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import DOMUtil from '../util/htmlUtil';
import ListView from './ListView';
import EntryRow from './EntryRow';
import ViewMixin from '../view/ViewMixin';
import ListPlaceholder from '../placeholder/ListPlaceholder';
import './list.scss';

const orderByName = function (list, names) {
  const idx = {};
  if (!names) {
    return list;
  }
  list.forEach((o) => {
    idx[o.name] = o;
  });
  return names.map(n => idx[n]);
};

const RowClick = declare([], {
  open(params) {
    window.location = params.list.getRowClickLink(params.row);
  },
});

export default declare([_WidgetBase, ViewMixin], {
  rowClass: EntryRow,
  listViewClass: ListView,
  listButtonMenu: null,
  includeSortOptions: true,
  includeRefreshButton: false,
  includeHead: true,
  includeHeader: false,
  /**
   * Show the result size of a search
   */
  includeResultSize: true,
  /**
   * Show the size of the list (even if no search is performed)
   */
  includeSizeByDefault: false,
  includeMassOperations: false,
  listInDialog: false,
  nlsTypeaheadPlaceholderKey: 'typeaheadPlaceholder',
  nlsListHeaderKey: 'listHeader',
  nlsListHeaderTitleKey: 'listHeaderTitle',
  searchInList: true,
  searchVisibleFromStart: true,
  rowClickDefault: false, // If set to true, the getRowClickLink must be implemented
  rowClickDialog: null,
  entryType: null,
  class: '',
  placeholderClass: ListPlaceholder,
  nlsEmptyListWarningKey: 'emptyMessage',

  buildRendering() {
    this.domNode = DOMUtil.create('div');
    this.domNode.classList.add('escoList');
    this.dialogsNode = DOMUtil.create('div', null, this.domNode);
    this.dialogs = {};
    this.listActions = [];
    this.rowActions = [];
  },
  postCreate() {
    this.inherited('postCreate', arguments);
    if (this.rowClickDefault) {
      this.rowClickDialog = '_rowClick';
      this.registerDialog('_rowClick', RowClick);
    }
    if (this.includeRefreshButton) {
      this.registerListAction({
        name: 'refresh',
        button: 'default',
        icon: 'refresh',
        nlsKey: 'refreshButtonLabel',
        nlsKeyTitle: 'refreshTitle',
        noMenu: true,
      });
    }
    const LVCls = this.listViewClass;
    this.listView = new LVCls({
      class: this.class,
      list: this,
      buttonMenu: this.listButtonMenu,
      rowClass: this.rowClass,
      includeHead: this.includeHead,
      includeHeader: this.includeHeader,
      includeResultSize: this.includeResultSize,
      includeSizeByDefault: this.includeSizeByDefault,
      nlsTypeaheadPlaceholderKey: this.nlsTypeaheadPlaceholderKey,
      nlsListHeaderKey: this.nlsListHeaderKey,
      nlsListHeaderTitleKey: this.nlsListHeaderTitleKey,
      searchInList: this.searchInList,
      searchVisibleFromStart: this.searchVisibleFromStart,
      rowClickDialog: this.rowClickDialog,
      placeholderClass: this.placeholderClass,
      includeSortOptions: this.includeSortOptions,
      includeMassOperations: this.includeMassOperations,
    },
    DOMUtil.create('div', null, this.domNode));
    if (this.listInDialog) {
      // domClass.remove(this.listView.domNode, 'container');
      this.listView.domNode.classList.remove('container');
      // domClass.add(this.domNode, 'listInDialog');
      this.domNode.classList.add('listInDialog');
    }
  },
  show() {
    this.render();
    if (this.nlsGenericBundle) {
      this.updateLocaleStrings();
    }
  },
  getName() {
  },
  getIconClass() {
  },
  render() {
    this.listView.clearView();
    this.search();
  },

  registerDialog(dialogName, DialogClass) {
    this.dialogs[dialogName] = new DialogClass({ list: this }, DOMUtil.create('div', null, this.dialogsNode));
  },
  /**
   * @deprecated use corresponding method registerListAction.
   */
  registerListButton(params) {
    this.listActions.push(params);
  },
  /**
   * @deprecated use corresponding method registerRowAction.
   */
  registerRowButton(params) {
    this.rowActions.push(params);
  },
  /**
   * @deprecated use corresponding method getListActions.
   */
  getListButtons() {
    return this.listActions;
  },
  /**
   * @deprecated use corresponding method getRowActions.
   */
  getRowButtons() {
    return this.rowActions;
  },
  /**
   * @deprecated use corresponding method installActionOrNot.
   */
  installRowButtonOrNot() {
    // Implement
  },

  installActionOrNot() {
    // Implement
  },

  registerListAction(params) {
    this.listActions.push(params);
  },

  registerRowAction(params) {
    this.rowActions.push(params);
  },
  getListActions() {
    if (!this._listActions) {
      this._listActions = orderByName(this.listActions, this.listActionNames);
    }
    return this._listActions;
  },

  getRowActions() {
    if (!this._rowActions) {
      this._rowActions = orderByName(this.rowActions, this.rowActionNames);
    }
    return this._rowActions;
  },

  openDialog(dialogName, params) {
    params.list = this;
    params.dialogName = dialogName;
    if (this.dialogs[dialogName]) {
      this.dialogs[dialogName].open(params);
    } else {
      console.warn(`No dialog registered with name: ${dialogName}`);
    }
  },

  getRowClickLink() {
    // Override and return a link if the rows should display their labels as links
  },

  updateLocaleStrings(generic, specific) {
    this.nlsGenericBundle = generic || this.nlsGenericBundle;
    this.nlsSpecificBundle = specific || this.nlsSpecificBundle;
    this.listView.updateLocaleStrings(this.nlsGenericBundle, this.nlsSpecificBundle);
  },

  getEmptyListWarning() {
    const key = this.nlsEmptyListWarningKey;
    const generic = this.nlsGenericBundle;
    const specific = this.nlsSpecificBundle;
    if (specific) {
      return (specific && specific[key]) || generic[key] || '';
    }

    return '';
  },

  getNlsForCButton() {
    let nlsObj = [];
    const key = this.nlsCreateEntryLabel;
    const keyTitle = this.nlsCreateEntryTitle;
    const generic = this.nlsGenericBundle;
    const specific = this.nlsSpecificBundle;
    if (specific) {
      nlsObj.nlsKey = (specific && specific[key]) || generic[key] || '';
      nlsObj.nlsKeyTitle = (specific && specific[keyTitle]) || generic[keyTitle] || '';
      nlsObj = nlsObj.nlsKey === '' ? {} : nlsObj;
    }
    return nlsObj;
  },

  removeRow(row) {
    this.getView().removeRow(row);
  },
  addRowForEntry(entry) {
    this.getView().addRowForEntry(entry);
  },
  getView() {
    return this.listView;
  },
  search(paramsParams) {
    const params = paramsParams || {};
    const qo = this.getSearchObject();
    if (params.sortOrder === 'title') {
      const l = this.useNoLangSort ? 'nolang' : i18n.getLocale();
      qo.sort(`title.${l}+asc`);
    } else {
      qo.sort('modified+desc');
    }
    if (params.term != null && params.term.length > 0) {
      if (config.entrystore.defaultSolrQuery === 'all') {
        qo.all(params.term);
      } else {
        qo.title(params.term);
      }
    }
    if (config.entrystore.defaultSolrLimit) {
      qo.limit(config.entrystore.defaultSolrLimit);
    }
    const es = registry.get('entrystore');
    const list = es.createSearchList(qo);
    this.listView.showEntryList(list);
  },
  getSearchObject() {
    console.error('You have not implemented the method getSearchObject on the List.');
  },
});
