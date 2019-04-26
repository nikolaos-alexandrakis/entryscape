import registry from 'commons/registry';
import htmlUtil from 'commons/util/htmlUtil';
import PubSub from 'pubsub-js';
import keys from 'commons/util/keyCodeUtil';
import { types } from 'store';
import Placeholder from 'commons/placeholder/Placeholder';
import ViewMixin from 'commons/view/ViewMixin';
import { NLSMixin } from 'esi18n';
import eswoCollection from 'workbench/nls/eswoCollection.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import hash from 'dojo/hash';
import './eswoCollection.scss';
import CollectionItemContainer from './components/CollectionItemContainer';
import template from './CollectionTemplate.html';

// const queryString = require('query-string');


export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit, ViewMixin], {
  bid: 'eswoCollection',
  viewName: 'workbenchcollections',
  specificViewParam: 'collection',
  viewParams: new Set(['view', 'context', 'collection']),
  renderOnCalltype: new Set(['createEntry', 'commitMetadata', 'delEntry', 'addToList', 'removeFromList']),
  nlsBundles: [{ eswoCollection }],
  templateString: template,
  __sideList: null,
  __list: null,
  __placeholder: null,
  configuredEntitytypes: [],

  init() {
    this.collections = [];
    this.collectionsEntries = new Map();
    this.collectionSizes = new Map();
    this.allSizesPromises = [];
  },
  postCreate() {
    this.inherited(arguments);
    const sm = registry.get('siteManager');
    this.init();

    // Register various listeners to handle all collection entry actions
    PubSub.subscribe('spa.beforeViewChange', (err, params) => { // TODO needs binding?
      if (params[0] !== this.viewName) {
        this.stopListenForCollectionChanges();
        this.init();
        // clear collection view params
        // remove 'collection'
        const viewParams = sm.getUpcomingOrCurrentParams();
        delete viewParams[this.specificViewParam];
      }
    });

    const es = registry.get('entrystore');
    es.addAsyncListener((promise, callType) => {
      if (this.renderOnCalltype.has(callType)) {
        promise.then((entry) => {
          const viewParams = sm.getUpcomingOrCurrentParams();
          if (this.viewName === viewParams.view) {
            let nList;
            let newSize;
            switch (callType) {
              case 'delEntry':
                this.deleteCollection(this.getCollectionIdFromParams());
                break;
              case 'createEntry':
                if (entry.isList()) {
                  this.createCollection(entry);
                }
                break;
              case 'addToList':
                newSize = this.collectionSizes.get(entry.getId()) + 1;
                this.collectionSizes.set(entry.getId(), newSize);
                nList = document.querySelector('.eswoCollection__listItem.active span.badge');
                nList.innerHTML = newSize;
                break;
              case 'removeFromList':
                newSize = this.collectionSizes.get(entry.getId()) - 1;
                this.collectionSizes.set(entry.getId(), newSize);
                nList = document.querySelector('.eswoCollection__listItem.active span.badge');
                nList.innerHTML = newSize;
                break;
              case 'commitMetadata':
                if (entry.isList()) {
                  this.updateCollection(entry);
                }
                break;
              default:
            }
          }
        });
      }
    });
  },

  startListenForCollectionChanges() {

  },
  stopListenForCollectionChanges() {

  },

  getCollectionIdFromParams() {
    const st = registry.get('siteManager');
    // for some reason getUpcomingOrCurrentParams doesn't return the correct value here
    const { collection } = st.getCurrentParams();
    return collection > 0 ? collection : -1;
  },

  deleteCollection(collectionId) {
    this.updateCollectionState(collectionId, null, false, true);
  },
  createCollection(collectionEntry) {
    this.updateCollectionState(collectionEntry.getId(), collectionEntry, true);
  },
  updateCollection(collectionEntry) {
    this.updateCollectionState(collectionEntry.getId(), collectionEntry);
  },
  /**
   * Updates the collection entry in the collection list and triggers a cache refresh.
   *
   * @param collection
   */
  updateCollectionState(collectionId, collection, create = false, remove = false) {
    if (remove) {
      this.collections.splice(this.collections.indexOf(collectionId), 1);
      this.collectionsEntries.delete(collectionId);
      // TODO remove from map as well
    } else if (create) {
      this.collections.push(collectionId);
      this.collectionsEntries.set(collectionId, collection);
      this.collectionSizes.set(collectionId, 0); // set newly created size to 0
    } else {
      this.collectionsEntries.set(collectionId, collection);
    }

    this.validateViewSpecificParam(collectionId);
    this.render(this.getSelectedCollection(collectionId));
  },
  /**
   * Returns the currently selected collection entry or the first collection.
   *
   * @param collectionId
   * @return {V}
   */
  getSelectedCollection(collectionId) {
    if (collectionId && this.collections.indexOf(collectionId) !== -1) {
      return this.collectionsEntries.get(collectionId) ||
        this.collectionsEntries.values().next().value;
    }

    return this.collectionsEntries.values().next().value;
  },

  validateViewSpecificParam(selectedCollectionId) {
    // Append 'collection' param if not present
    // TODO use siteManager for this

    const viewParams = queryString.parse(hash());
    if (Object.keys(viewParams).indexOf(this.specificViewParam) === -1) {
      const collectionId = viewParams[this.specificViewParam];
      if (this.collections.indexOf(collectionId) === -1) {
        viewParams[this.specificViewParam] = selectedCollectionId;
        hash(queryString.stringify(viewParams));
      }
    } else {
      viewParams[this.specificViewParam] = selectedCollectionId;
      hash(queryString.stringify(viewParams));
    }
  },
  /**
   * @param collectionEntry
   * @return Promise
   */
  updateCollectionSize(collectionEntry) {
    return collectionEntry.getResource(true).getEntries().then(() => {
      const collectionId = collectionEntry.getId();
      this.collectionSizes.set(collectionId, collectionEntry.getResource(true).getSize());
    });
  },

  show(params) {
    if (this.collections.length > 0) {
      // do some shit and then render
      const selectedCollection = this.getSelectedCollection(params.collection);
      const selectedCollectionId = selectedCollection.getId();

      this.validateViewSpecificParam(selectedCollectionId);

      this.render(selectedCollection);
    } else {
      const es = registry.get('entrystore');
      const context = registry.get('context');

      es.newSolrQuery().context(context).sort('created+desc').graphType(types.GT_LIST)
        .list()
        .forEach((collectionEntry) => {
          this.collections.push(collectionEntry.getId());
          this.collectionsEntries.set(collectionEntry.getId(), collectionEntry);
          this.collectionSizes.set(collectionEntry.getId(), '?');
        })
        .then(() => {
          // Render selected collection
          const selectedCollection = this.getSelectedCollection(params.collection);
          if (selectedCollection) {
            const selectedCollectionId = selectedCollection.getId();

            this.validateViewSpecificParam(selectedCollectionId);

            this.render(selectedCollection);

            // Get sizes for collections asynchronously and re-render
            this.collectionsEntries.forEach((collectionEntry) => {
              this.allSizesPromises.push(this.updateCollectionSize(collectionEntry));
            });

            Promise.all(this.allSizesPromises).then(() => {
              this.render(selectedCollection);
            });
          } else {
            this.render();
          }
        }, this);
    }
  },

  destroyEditors() {
    if (this.list) {
      this.list.destroy();
      delete this.list;
    }
  },

  render(selectedCollection) {
    this.__multipleEtypes.style.display = 'block';
    this.__singleEtype.style.display = 'none';
    this.__list.innerHTML = '';
    this.__placeholder.style.display = '';

    this.destroyEditors();

    if (selectedCollection) {
      m.render(this.__sideList, m(CollectionItemContainer, {
        selectedCollection,
        collectionSizes: this.collectionSizes,
        viewParams: this.viewParams,
        placeholderNode: this.__placeholder,
        collectionIds: this.collections,
        collectionEntries: this.collectionsEntries,
        listContainerNode: this.__list,
        bid: this.bid,
      }));
    } else {
      m.render(this.__sideList, null);
    }
    // todo change the URL's collection to selectedCollection.getId()
  },
  localeChange() {
    if (!this.placeholder) {
      this.placeholder = new Placeholder({}, htmlUtil.create('div', null, this.__placeholder));
      this.placeholder.getText = () => this.NLSLocalized0.selectEntitytypeMessage;
      this.placeholder.render();
    }
  },
  _checkKey(ev) {
    if (ev.keyCode === keys.ENTER) {
      this._createCollection();
    }
  },
  _createCollection() {
    const defLang = registry.get('defaultLocale');
    const collectionLabel = this._collectionTitle;
    const label = collectionLabel.value;
    if (label === '' || label == null) {
      return;
    }
    let l;
    if (typeof defLang === 'string' && defLang !== '') {
      l = defLang;
    }

    this._newCollection = registry.get('context').newList();
    const md = this._newCollection.getMetadata();
    const uri = this._newCollection.getResourceURI();

    md.addL(uri, 'dcterms:title', label, l);

    this._newCollection.setMetadata(md).commit().then(() => {
      // clear collection input field
      this._collectionTitle.value = '';
    });
  },
});
