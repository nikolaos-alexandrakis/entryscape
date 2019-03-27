import registry from 'commons/registry';
import labels from 'blocks/utils/labels';

export default {
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
        if (group === 'term') {
          values.forEach(setValue);
        } else {
          const collectionName = `blocks_collection_${group}`;
          const collection = registry.get(collectionName);
          if (collection.list) {
            addFromCollection(collection);
          } else if (collection.type === 'facet') {
            registry.onChangeOnce(collectionName, (col) => {
              if (col.list) {
                addFromCollection(col);
              } else {
                registry.onChangeOnce(collectionName, addFromCollection);
              }
            });
          } else {
            values.forEach((item) => {
              labels([item.value]).then((uri2label) => {
                setValue({ label: uri2label[item.value], group, value: item.value });
              });
            });
          }
        }
      } else {
        values.forEach(setValue);
      }
    }
  },
};
