import registry from 'commons/registry';
import { mapValues } from 'lodash-es';

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

