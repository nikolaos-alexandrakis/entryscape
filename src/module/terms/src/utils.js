export default {
  isUnModified(entries) {
    const uri2modified = {};
    let counter = entries.length;
    const uris = entries.map((e) => {
      const ei = e.getEntryInfo();
      uri2modified[e.getURI()] = (ei.getModificationDate() || ei.getCreationDate()).getTime();
      return e.getURI();
    });
    const first = entries[0];
    const list = first.getEntryStore().newSolrQuery()
      .uri(uris)
      .context(first.getContext())
      .list();

    return list.forEach((e) => {
      const ei = e.getEntryInfo();
      const nd = (ei.getModificationDate() || ei.getCreationDate()).getTime();
      if (uri2modified[e.getURI()] === nd) {
        counter -= 1;
        return true;
      }
      return false;
    }).then(() => {
      if (counter > 0) {
        throw Error('At least one entry was modified');
      }
    });
  },
};
