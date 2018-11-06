import registry from 'commons/registry';
import params from 'blocks/boot/params';
import { Entry } from 'store';
import config from 'config';

  const es = registry.get('entrystore');
  const esu = registry.get('entrystoreutil');

  export default (data, callback, useSearch = true) => {
    let cid;
    let eid;

    const f = (entry) => {
      data.entry = entry;
      if (data.define) {
        setTimeout(() => {
          registry.set(`blocks_${data.define}`, entry);
        }, 1);
      }
      return entry;
    };

    const useRelation = (entry) => {
      if (data.relationinverse) {
        const qo = es.newSolrQuery().uriProperty(data.relationinverse, entry.getResourceURI());
        if (data.rdftype) {
          qo.rdfType(data.rdftype);
        }
        qo.limit(1).list().getEntries().then((arr) => {
          if (arr.length > 0) {
            f(arr[0]);
            callback(arr[0]);
          }
        });
      } else if (data.relation) {
        const relatedResource = entry.getMetadata().findFirstValue(entry.getResourceURI(),
          data.relation);
        if (relatedResource) {
          esu.getEntryByResourceURI(relatedResource).then(f).then(callback);
        }
      }
    };

    const onEntry = (entry) => {
      if (useSearch && (data.relation || data.relationinverse)) {
        useRelation(entry);
      } else if (useSearch && data.rdftype) {
        esu.getEntryByType(data.rdftype, cid ? es.getContextById(cid) : null)
          .then(f).then(callback);
      } else {
        f(entry);
        callback(entry);
      }
    };
    if (data.entry instanceof Entry) {
      onEntry(data.entry);
      return;
    }

    if (data.use) {
      registry.onChange(`blocks_${data.use}`, (entry) => {
        if (useSearch && (data.relation || data.relationinverse)) {
          useRelation(entry);
        } else {
          data.entry = entry;
          callback(entry);
        }
      }, true);
      return;
    }

    params.onInit((urlParams) => {
      const ncid = data.context || urlParams.context || config.econfig.context;
      const neid = data.entry || urlParams.entry || config.econfig.entry;
      if (ncid === cid && neid === eid) {
        if (urlParams.uri) {
          esu.getEntryByResourceURI(urlParams.uri).then(f).then(callback);
        } else if (urlParams.lookup) {
          const query = es.newSolrQuery().limit(1);
          if (config.econfig.lookupLiteral || urlParams.lookupLiteral) {
            query.literalProperty(config.econfig.lookupLiteral || urlParams.lookupLiteral,
              urlParams.lookup);
          } else if (config.econfig.lookupURI || urlParams.lookupURI) {
            query.uriProperty(config.econfig.lookupURI || urlParams.lookupURI, urlParams.lookup);
          } else {
            console.warn('No lookup property specified, assuming dcterms:identifier');
            query.literalProperty('dcterms:identifier', urlParams.lookup);
          }
          query.getEntries().then(arr => arr[0]).then(callback);
        } else {
          callback();
        }
      } else {
        cid = ncid;
        eid = neid;
        es.getEntry(es.getEntryURI(cid, eid)).then(onEntry);
      }
    });
  };
