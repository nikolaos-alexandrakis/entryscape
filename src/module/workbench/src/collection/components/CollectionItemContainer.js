import defaults from '../../defaults';
import htmlUtil from 'commons/util/htmlUtil';
import List from '../List';
import CollectionItem from './CollectionItem';

const getViewParams = (viewParams, collectionEntryId) => {
  const sm = registry.get('siteManager');
  return viewUtil.constructParams(viewParams, Object.assign({}, sm.getUpcomingOrCurrentParams()),
    {collection: collectionEntryId});
};

export default CollectionItemContainer = {
  /**
   * Creates and shows the list for a selected collection
   *
   * @param selectedCollection
   * @param listNode
   */
  createList(selectedCollection, listNode, placeholderNode) {
    placeholderNode.style.display = 'none';
    listNode.style.display = '';

    const newNode = htmlUtil.create('div', null, listNode);

    this.list = new List({
      selectedCollection,
    }, newNode);
    this.list.show();
  },
  getCollectionSize(collectionSizes, collectionId) {
    return collectionSizes.get(collectionId);
  },
  getCollectionLabel(collectionEntry) {
    return registry.get('rdfutils').getLabel(collectionEntry);
  },
  view(vnode) {
    const {
      collectionIds, collectionEntries, selectedCollection, collectionSizes, viewParams,
      listContainerNode, placeholderNode, bid,
    } = vnode.attrs;

    const sm = registry.get('siteManager');
    return collectionIds.map((collectionId) => {
      const collection = collectionEntries.get(collectionId);
      let active = false;

      if (collectionId === selectedCollection.getId()) {
        this.createList(collection, listContainerNode, placeholderNode);
        active = true;
      }

      const id = collectionId;
      const size = this.getCollectionSize(collectionSizes, collectionId);
      const title = this.getCollectionLabel(collection);
      const aParams = getViewParams(viewParams, collectionId);
      const href = sm.getViewPath(aParams.view, aParams);

      return m(CollectionItem, {id, title, size, active, href, bid});
    });
  },
};
