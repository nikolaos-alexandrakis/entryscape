define([
  'entryscape-commons/defaults',
  'entryscape-blocks/utils/labels',
], (defaults, labels) => ({
  setValues(filters, group, setValue) {
    const values = filters[group];
    if (values) {
      if (!values[0].label) {
        const addFromCollection = (col) => {
          values.forEach((item) => {
            const it = col.list.find(colItem => colItem.value === item.value);
            if (it) {
              setValue(it);
            } else {
              labels([item.value]).then((uri2label) => {
                setValue({ label: uri2label[item.value], group, value: item.value });
              });
            }
          });
        };
        const collectionName = `blocks_collection_${group}`;
        const collection = defaults.get(collectionName);
        if (collection.list) {
          addFromCollection(collection);
        } else {
          defaults.onChangeOnce(collectionName, (col) => {
            if (col.list) {
              addFromCollection(col);
            } else {
              defaults.onChangeOnce(collectionName, addFromCollection);
            }
          });
        }
      } else {
        values.forEach(setValue);
      }
    }
  },
}));
