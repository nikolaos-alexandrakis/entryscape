/**
 * Wraps an array of lists into something that looks like a single store/List.
 * @see {store/List}
 */
export default class {
  /**
   * Parameters may be:
   * lists - an array of lists to be combined into one.
   * limit - an integer specifying the page limit.
   *
   * @param {object} params
   */
  constructor(params) {
    this.limit = 20;
    this.size = 0;
    this.lists = [];
    this.sizes = [];

    this.lists = params.lists;
    this.limit = params.limit != null ? params.limit : this.limit;
  }

  loadEnoughSizes(page) {
    // eslint-disable-next-line consistent-return
    return new Promise((resolve) => {
      const needToReach = (page + 1) * this.limit;
      let amount = 0;
      const listLength = this.lists.length;
      for (let i = 0; i < listLength; i++) {
        if (isNaN(this.sizes[i])) {
          return this.lists[i].getEntries().then(function (listIndex) {
            this.sizes[listIndex] = this.lists[listIndex].getSize();
            return this.loadEnoughSizes(page);
          }.bind(this, i));
        }
        amount += this.sizes[i];
        if (amount > needToReach) {
          break;
        }
      }

      resolve(amount);
    });
  }

  getSize() {
    let amount = 0;
    for (let i = 0; i < this.sizes.length; i++) {
      if (isNaN(this.sizes[i])) {
        break;
      }
      amount += this.sizes[i];
    }
    return amount;
  }

  fillArray(arr, listNr, pageParam, offset) {
    let arr_ = arr;
    let listNr_ = listNr;
    let page = pageParam;
    return this.lists[listNr_].getEntries(page).then((entries) => {
      let entries_ = entries;
      if (entries_.length < this.limit) {
        listNr_ += 1;
        page = 0;
      } else {
        page += 1;
      }
      if (!isNaN(offset)) {
        entries_ = entries_.slice(offset);
      }
      arr_ = arr_.concat(entries_);
      if (arr_.length < this.limit) {
        if (listNr_ >= this.lists.length) {
          return arr_;
        }
        return this.fillArray(arr_, listNr_, page, 0);
      } else if (arr_.length > this.limit) {
        arr_ = arr_.slice(0, this.limit);
      }
      return arr_;
    });
  }

  getEntries(pageParam) {
    const page = isNaN(pageParam) ? 0 : pageParam;
    let offset = page * this.limit;
    return this.loadEnoughSizes(page).then(() => {
      let before = 0;
      let listNr = -1;
      for (let i = 0; i < this.lists.length; i++) {
        if (before + this.sizes[i] >= offset) {
          listNr = i;
          offset -= before;
          break;
        }
        before += this.sizes[i];
      }
      const startpage = Math.floor(offset / this.limit);
      offset -= startpage * this.limit;
      return this.fillArray([], listNr, startpage, offset);
    });
  }

  getLimit() {
    return this.limit;
  }
}
