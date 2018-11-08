import registry from 'commons/registry';

export default class {
  static limit = 20;
  constructor(userEntry) {
    this.userEntry = userEntry;
  }

  refresh() {
    delete this.groups;
  }

  getEntries(page) {
    const es = registry.get('entrystore');
    if (this.groups == null) {
      const groupURIs = this.userEntry.getParentGroups();
      return Promise.all(groupURIs.map(guri => es.getEntry(guri)))
        .then((groups) => {
          this.groups = groups;
          return this.getEntries(page);
        });
    }

    return new Promise(resolve => resolve(this.groups.slice(page * this.getLimit(), (page + 1) * this.getLimit())))
  }

  getLimit() {
    return GroupList.limit;
  }

  getSize() {
    return this.groups == null ? -1 : this.groups.length;
  }
};
