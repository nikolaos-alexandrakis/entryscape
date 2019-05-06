import registry from 'commons/registry';
import getEntry from 'blocks/utils/getEntry';

export default (node, data) => {
  getEntry(data, (entry) => {
    registry.set(data.signal, {
      entry,
      data,
    });
  });
};
