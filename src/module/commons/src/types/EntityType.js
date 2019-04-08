import { clone } from 'lodash-es';
import { namespaces } from 'rdfjson';
import registry from 'commons/registry';

const normalizeConstraints = (source) => {
  const c = clone(source.constraints) || {};
  if (source.rdfType) {
    c['rdf:type'] = source.rdfType;
  }
  Object.keys(c).forEach((co) => {
    let obj = c[co];
    delete c[co];
    if (Array.isArray(obj)) {
      obj = obj.map(o => namespaces.expand(o));
    } else {
      obj = [namespaces.expand(obj)];
    }
    c[namespaces.expand(co)] = obj;
  });
  return c;
};

export default class {
  constructor(source) {
    this.source = source;
    this.source.constraints = normalizeConstraints(source);
  }
  constraints() {
    return this.source.constraints;
  }
  id() {
    return this.source.id;
  }
  label() {
    return this.source.label;
  }
  refines() {
    return this.source.refines;
  }
  useWith() {
    return this.source.useWith;
  }
  templateId() {
    return this.source.template;
  }
  template() {
    return registry.get('itemstore').getItem(this.source.template);
  }
  match(entry) {
    const md = entry.getMetadata();
    const r = entry.getResourceURI();
    return Object.entries(this.source.constraints).every((pair) => {
      const p = pair[0];
      const val = pair[1];
      if (Array.isArray(val)) {
        return val.some(o => md.find(r, p, o).length > 0);
      }
      return md.find(r, p, val).length > 0;
    });
  }
}
