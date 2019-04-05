import registry from 'commons/registry';
import params from 'blocks/boot/params';
import { mapValues } from 'lodash-es';

let urlParams = {};
params.onInit((up) => {
  urlParams = up;
});

export const termsConstraint = (qo, term) => {
  if (term != null && term.length > 0) {
    const qtemplate = registry.get('blocks_query') || {
      title: 1,
      description: 1,
      'tag.literal': 1,
    };

    (Array.isArray(term) ? term : [term]).forEach((t) => {
      const _t = t[t.length - 1] === '*' ? t.substr(0, t.length - 1) : t;
      qo.or(mapValues(qtemplate, (val) => {
        if (_t === '*') {
          return _t;
        } else if (_t.length === 0) {
          return '*';
        }
        switch (val) {
          case 3:
            return [`${_t}*`, `${_t}`];
          case 2:
            return `${_t}*`;
          case 1:
          default:
            return _t;
        }
      }));
    });
  }
};

export const facetSearchQuery = (term, data, collection) => {
  const es = registry.get('entrystore');
  const qo = es.newSolrQuery().publicRead();

  const context = collection.context || (data.context === true ? urlParams.context : data.context);
  if (context) {
    qo.context(context);
  }
  if (collection.rdftype) {
    qo.rdfType(collection.rdftype);
  }
  if (collection.searchproperty) {
    if (!term.length) {
      qo.literalProperty(collection.searchproperty, '*');
    } else {
      qo.literalProperty(collection.searchproperty, [term, `${term}*`], undefined,
        collection.searchIndextype, collection.related);
    }
  } else if (!term.length) {
    qo.title('*');
  } else if (term.length < 3) {
    qo.title(`${term}*`);
  } else {
    qo.title(term);
  }
  return qo;
};
