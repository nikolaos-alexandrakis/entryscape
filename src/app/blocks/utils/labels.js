define([
    'entryscape-commons/defaults'
], (defaults) => {
    const rdfutils = defaults.get("rdfutils");
    const localize = defaults.get("localize");
    const es = defaults.get('entrystore');
    const cache = es.getCache();

    return (values, valueType = 'uri') => {
      const val2choice = defaults.get("itemstore_choices");
      const val2named = defaults.get("blocks_named");

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
        };
        values.forEach(function(value) {
            let label = getLabel(value);
            if (label) {
                labels[value] = label;
            } else if (valueType === 'uri') {
                toLoad[value] = true;
            } else {
                labels[value] = value;
            }
        });
        let toLoadArr = Object.keys(toLoad);
        if (toLoadArr.length === 0) {
            return new Promise((resolve) => resolve(labels));
        }
        return es.newSolrQuery().resource(toLoadArr).list().forEach(function(entry) {
            labels[entry.getResourceURI()] = rdfutils.getLabel(entry);
        }).then(function() {
            return labels;
        });
    }
});
