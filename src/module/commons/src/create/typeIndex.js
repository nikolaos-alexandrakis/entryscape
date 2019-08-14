import { isArray, clone } from 'lodash-es';
import config from 'config';
import registry from 'commons/registry';

const typeIdx = {};

const getType2Conf = () => {
  const ns = registry.get('namespaces');
  const type2Conf = {};
  config.entitytypes.forEach((conf) => {
    if (isArray(conf.rdfType)) {
      conf.rdfType.forEach((et) => {
        type2Conf[ns.expand(et)] = conf;
      });
    } else {
      type2Conf[ns.expand(conf.rdfType)] = conf;
    }
  });

  return type2Conf;
};

const query = (qoParam, conf, term) => {
  let qo = qoParam;
  if (conf.rdfType) {
    qo = qo.rdfType(conf.rdfType);
  }
  const constr = conf.constraints;
  if (constr) {
    Object.keys(constr).forEach((key) => {
      if (key[0] === '!') {
        qo = qo.uriProperty(key.substr(1), constr[key], 'not');
      } else {
        qo = qo.uriProperty(key, constr[key]);
      }
    });
  }

  if (term) {
    if (conf.searchProps) {
      let props = conf.searchProps;
      if (typeof props === 'string') {
        props = [props];
      }
      props.forEach((prop) => {
        qo = qo.literalProperty(prop, `*${term}*`);
      });
      qo = qo.disjunctiveProperties();
    } else if (config.entrystore.defaultSolrQuery === 'all') {
      qo = qo.all(term);
    } else {
      qo = qo.title(term);
    }
  }

  return qo;
};

const update = (cid, conf, node) => {
  if (typeof typeIdx[cid] === 'undefined') {
    typeIdx[cid] = {};
  }
  const bi = typeIdx[cid][conf.name];
  if (typeof bi === 'undefined') {
    node.innerHTML = '?';
    const es = registry.get('entrystore');
    const list = query(es.newSolrQuery(), conf)
      .context(registry.get('context'))
      .limit('1').list();
    typeIdx[cid][conf.name] = list.getEntries().then(() => {
      const count = list.getSize();
      node.innerHTML = `${count}`;
      typeIdx[cid][conf.name] = count;
      return count;
    });
  } else if (typeof bi.then === 'function') {
    node.innerHTML = '?';
    bi.then((count) => {
      node.innerHTML = count;
    });
  } else {
    node.innerHTML = bi;
  }
};

const getConf = (entry) => {
  if (entry) {
    const rt = entry.getMetadata().findFirstValue(entry.getResourceURI(), 'rdf:type');
    const type2Conf = getType2Conf();
    return type2Conf[rt];
  }
  // var context = registry.get("context");
  const etype = registry.get('siteManager').getUpcomingOrCurrentParams().etype;
  const etypes = config.entitytypes;
  if (etypes && etypes.length > 0) {
    if (etype != null) {
      for (let i = 0; i < etypes.length; i++) {
        if (etypes[i].name === etype) {
          return etypes[i];
        }
      }
    }
    return etypes[0];
  }

  return {};
};

const getConfByName = (name) => {
  let c;
  config.entitytypes.forEach((conf) => {
    if (conf.name === name) {
      c = conf;
    }
  });
  return c;
};

const updateCount = (entry, add) => {
  const ci = entry.getContext().getId();
  if (typeof typeIdx[ci] !== 'undefined') {
    const conf = getConf(entry);
    if (conf.name != null && typeIdx[ci][conf.name] != null) {
      typeIdx[ci][conf.name] += add;
      return typeIdx[ci][conf.name];
    }
    return add ? 1 : 0;
  }
  return null;
};

/**
 * Matches two arrays of constraints (where the constraints in the arrays are
 * considered disjunctive)
 * 1) The array1 have the same length and are the same as array2 (but maybe different order)
 * 2) All constraints in array1 are contained in array2
 * 3) First constraint of array1 occurs in array2
 * 4) Some constraint of array1 occurs in array2
 *
 * @param {array} array1 is an array of constraints to look for
 * @param {array} array2 is an array of constraints to check against
 * @returns {number|undefined} 1 for the best match and 4 for worst, undefined if no match at all.
 */
const matchConstraints = (array1 = [], array2 = []) => {
  if (array1 != null && array1.length <= array2.length) {
    let match = true;
    array1.some((a1) => {
      if (array2.indexOf(a1) === -1) {
        match = false;
      }
    });
    if (match) {
      if (array1.length === array2.length) {
        return 1;
      }
      return 2;
    }
  } else if (array1[0] === array2[0]) {
    return 3;
  } else if (
    array1.some((a1) => {
      if (array2.indexOf(a1) !== -1) {
        return true;
      }
      return false;
    })) {
    return 4;
  }

  return undefined;
};

/**
 * Normalizes constraints
 * 1) Making a clone, avoiding call by reference
 * 2) Expanding all namespace abbreviations
 * 3) Makes sure all values are arrays in the constraint object
 *
 * @param constraints
 * @returns {object}
 */
const normalizeConstraints = (constraints) => {
  const ns = registry.get('namespaces');
  const c = clone(constraints);
  Object.keys(c).forEach((co) => {
    let obj = c[co];
    delete c[co];
    if (isArray(obj)) {
      obj = obj.map(o => ns.expand(o));
    } else {
      obj = [ns.expand(obj)];
    }
    c[ns.expand(co)] = obj;
  });

  return c;
};

/**
 * Normalizes an entity type into a constraint object:
 * 1) Normalize according to {@link normalizeConstraints} function
 * 2) Inlines rdfType
 *
 * @param {object} et the entity type definition, taken from the config
 * @returns {object} the constraints object, no reference
 *  to original constraints object, it is cloned.
 */
const normalizeETConstraints = (et) => {
  const ns = registry.get('namespaces');
  const etconstr = normalizeConstraints(et.constraints || {});
  const rt = ns.expand('rdf:type');
  if (et.rdfType && typeof etconstr[rt] === 'undefined') {
    const ett = et.rdfType;
    if (isArray(ett)) {
      etconstr[rt] = ett.map(t => ns.expand(t));
    } else {
      etconstr[rt] = [ns.expand(ett)];
    }
  }
  return etconstr;
};

/**
 * Retrieves the most appropriate entity type configuration given a constraints
 * object, typically from a rdforms template constraints parameter.
 * Note that at a perfect match cannot be guaranteed,
 * but if the constraints object asks for several properties
 * the entity type returned must satisfy each property.
 *
 * @return {object|undefined} an entitytype configuration object,
 * undefined if no appropriate match could be found.
 */
const getConfFromConstraints = (constraintsParams) => {
  const entitesWithmc = [];
  const constraints = normalizeConstraints(constraintsParams);
  if (config.entitytypes) {
    for (let idx = 0; idx < config.entitytypes.length; idx++) {
      const et = config.entitytypes[idx];
      // Normalize so everything is in constraints (including rdfType).
      const etconstr = normalizeETConstraints(et);
      const mc = { et, tot: 0 };
      let isMatch = true;
      Object.keys(constraints).forEach((constr) => {
        mc[constr] = matchConstraints(constraints[constr], etconstr[constr]);
        const m = mc[constr];
        if (typeof m === 'undefined') {
          isMatch = false;
        } else {
          mc.tot += m;
        }
      });
      if (isMatch) {
        entitesWithmc.push(mc);
      }
    }
    if (entitesWithmc.length > 0) {
      entitesWithmc.sort((et1, et2) => (et1.tot < et2.tot ? -1 : 1));
      return entitesWithmc[0].et;
    }
  }

  return undefined;
};

const addConstraints = (entityConf, entry) => {
  const etconstr = normalizeETConstraints(entityConf);
  Object.keys(etconstr).forEach((prop) => {
    etconstr[prop].forEach((obj) => {
      entry.add(prop, obj);
    });
  });
};

export default {
  set(cid, conf, num) {
    if (typeof typeIdx[cid] === 'undefined') {
      typeIdx[cid] = {};
    }
    typeIdx[cid][conf.name] = num;
  },
  get(cid, conf) {
    if (typeof typeIdx[cid] !== 'undefined') {
      return typeIdx[cid][conf.name];
    }
    return 0;
  },
  query,
  update,
  getConf,
  getConfByName,
  getConfFromConstraints,
  addConstraints,
  add(entry) {
    return updateCount(entry, 1);
  },
  remove(entry) {
    return updateCount(entry, -1);
  },
};
