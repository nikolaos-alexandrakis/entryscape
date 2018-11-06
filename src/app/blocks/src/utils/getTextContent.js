import string from 'dojo/string'; // TODO @scazan
import { utils } from 'rdforms';
import registry from 'commons/registry';

  const rdfutils = registry.get('rdfutils');
  const special = {
    label(entry) {
      return rdfutils.getLabel(entry);
    },
  };
  const varRegexp = /\$\{([^\s\:\}]*)(?:\:([^\s\:\}]+))?\}/g;

  export default function (data, entry) {
    if (data.content) {
      let content = data.content;
      const vars = content.match(varRegexp).map(v => v.substr(2, v.length - 3));
      const defaultProj = {};
      const vals = {};
      const mapping = {};
      array.forEach(vars, (v) => {
        let nv = v;
        let fallback = '';
        const arr = v.split('|');
        if (arr.length > 1) {
          nv = arr[0];
          fallback = arr[1];
        }
        if (special[nv]) {
          vals[nv] = special[nv](entry) || fallback;
        } else {
          const vp = nv.replace(':', '_');
          defaultProj[vp] = fallback;
          mapping[vp] = nv;
          content = content.replace(new RegExp(`\\\${${v.replace('|', '\\|')}}`, 'g'), `\${${vp}}`);
        }
      });
      const pr = entry.getMetadata().projection(entry.getResourceURI(), mapping, 'statement');
      Object.keys(mapping).forEach((key) => {
        const stmts = pr[`*${key}`];
        const lmap = {};
        if (stmts) {
          stmts.forEach((stmt) => {
            if (stmt.getLanguage()) {
              lmap[stmt.getLanguage()] = stmt.getValue();
            }
          });
        }
        if (Object.keys(lmap).length > 0) {
          pr[key] = utils.getLocalizedValue(lmap).value;
        }
      });
      const obj = { ...vals, ...defaultProj, ...pr };

      return string.substitute(content, obj);
    } else if (data.property) {
      return entry.getMetadata().findFirstValue(null, data.property);
    }
    return rdfutils.getLabel(entry);
  };
