import registry from 'commons/registry';
import UserRow from '../users/UserRow';
import {template} from 'lodash-es';
import declare from 'dojo/_base/declare';

const ns = registry.get('namespaces');

export default declare([UserRow], {
  /**
   * @deprecated use corresponding method installActionOrNot.
   */
  installButtonOrNot(params) {
    const id = this.entry.getId();
    if (id === '_users' || id === '_admins') {
      if (id !== '_admins' || params.name !== 'members') {
        return 'disabled';
      }
    }
    return this.inherited(arguments);
  },
  installActionOrNot(params) {
    const id = this.entry.getId();
    if (id === '_users' || id === '_admins') {
      if (id === '_users' && params.name === 'members') {
        return 'disabled';
      }
      if (params.name === 'remove') {
        return 'disabled';
      }
    }
    return this.inherited(arguments);
  },
  getRenderName() {
    const md = this.entry.getMetadata();
    const rdfutils = registry.get('rdfutils');
    const name = md.findFirstValue(this.entry.getResourceURI(),
      ns.expand('foaf:name'))
      || rdfutils.getLabel(this.entry)
      || this.entry.getResource(true).getName();

    if (name != null) {
      return name;
    }
    const id = this.entry.getId();
    return template(this.nlsSpecificBundle.unnamedGroup)({id});
  },
});
