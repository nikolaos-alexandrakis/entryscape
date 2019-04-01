import registry from 'commons/registry';
import { promiseUtil } from 'store';

export default (values, valueType = 'uri') => {
  const rdfutils = registry.get('rdfutils');
  const localize = registry.get('localize');
  const es = registry.get('entrystore');
  const cache = es.getCache();

  const val2choice = registry.get('itemstore_choices');
  const val2named = registry.get('blocks_named');

  const toLoad = {};
  const labels = {};
  const getLabel = (value) => {
    const named = val2named[value];
    const choice = val2choice[value];
    const entryArr = cache.getByResourceURI(value);
    if (named) {
      return localize(named);
    } else if (choice) {
      return localize(choice.label);
    } else if (entryArr.length > 0) {
      return rdfutils.getLabel(entryArr[0]);
    }

    return null;
  };
  values.forEach((value) => {
    const label = getLabel(value);
    if (label) {
      labels[value] = label;
    } else if (valueType === 'uri') {
      toLoad[value] = true;
    } else {
      labels[value] = value;
    }
  });
  const toLoadArr = Object.keys(toLoad);
  if (toLoadArr.length === 0) {
    return new Promise(resolve => resolve(labels));
  }

  const chunked = [];
  const chunkLimit = 30;
  for (let i = 0; i < toLoadArr.length; i += chunkLimit) {
    chunked.push(toLoadArr.slice(i, i + chunkLimit));
  }
  return promiseUtil.forEach(chunked, chunk => es.newSolrQuery()
    .resource(chunk).forEach((entry) => {
      labels[entry.getResourceURI()] = rdfutils.getLabel(entry);
    })).then(() => labels);
};
