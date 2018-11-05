import registry from 'commons/registry';
import aspect from 'dojo/aspect'; // TODO replace when you get rid of aspect

const context2date = {};

export default (listView) => {
  aspect.after(listView, '_checkSize', () => {
    const userInfo = registry.get('userInfo');
    if (userInfo && userInfo.id !== '_guest') {
      if (listView.searchTerm == null || listView.searchTerm === '') {
        const contextId = registry.get('context').getId();
        const time = context2date[contextId];
        if (!time || new Date().getTime() > time) {
          context2date[contextId] = new Date().getTime() + 1200000; //20 min
          listView.catalogPromise.then((dcat) => {
            const listURIs = [];
            listView.entryList.forEach((ds) => {
              listURIs.push(ds.getResourceURI());
            }).then(() => {
              const md = dcat.getMetadata();
              const catURIs = md.find(dcat.getResourceURI(), 'dcat:dataset').map(stmt =>
                stmt.getValue());

              if (catURIs.find((uri) => listURIs.indexOf(uri) === -1) ||
                listURIs.find((uri) => catURIs.indexOf(uri) === -1)) {
                md.findAndRemove(dcat.getResourceURI(), 'dcat:dataset');
                listURIs.forEach((uri) => {
                  md.add(dcat.getResourceURI(), 'dcat:dataset', uri);
                })
                dcat.commitMetadata();
              }
            });
          });
        }
      }
    }
  });
};
