import registry from 'commons/registry';
import { mapValues } from 'lodash-es'

export const termsConstraint = (qo, term) => {
  if (term != null && term.length > 0) {
    const qtemplate = registry.get('blocks_query') || {
      title: 1,
      description: 1,
      'tag.literal': 1,
    };

    (Array.isArray(term) ? term : [term]).forEach((t) => {
      qo.or(mapValues(qtemplate, (val) => {
        switch(val) {
          case 3:
            return [`${t}*`, `${t}`];
          case 2:
            return `${t}*`;
          case 1:
          default:
            return t;
        }
      }));
    });
  }
};

