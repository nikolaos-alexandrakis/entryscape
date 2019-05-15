import m from 'mithril';
import './statement.scss';
import Statement from './Statement';

/**
 * entry - the entry matching the query
 * from - an object containing a matching triple.
 * @type {{view: ((vnode))}}
 */
export default {
  view(vnode) {
    const {
      entry,
      from,
    } = vnode.attrs;
    const stmts = entry.getMetadata().find(
      from.s === '' ? null : from.s,
      from.p === '' ? null : from.p,
      from.o === '' ? null : { value: from.o, type: 'literal' });
    return (
      <tbody className="entry__row">
        {stmts.map(stmt => <Statement statement={stmt}/>)}
      </tbody>
    );
  },
};
