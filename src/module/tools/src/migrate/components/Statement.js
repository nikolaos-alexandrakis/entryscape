import { namespaces } from 'rdfjson';
import './statement.scss';

/**
 *
 * @type {{view: ((vnode))}}
 */
export default {
  view(vnode) {
    const {
      statement,
    } = vnode.attrs;
    return (
      <tr className="statement__row">
        <td className="statement__subject"
          title={statement.getSubject()}>{namespaces.shortenKnown(statement.getSubject())}</td>
        <td className="statement__predicate"
          title={statement.getPredicate()}>{namespaces.shortenKnown(statement.getPredicate())}</td>
        {statement.getType() === 'uri' ?
          <td className="statement__object"
            title={statement.getValue()}>{namespaces.shortenKnown(statement.getValue())}</td> :
          <td className="statement__object">{statement.getValue()}</td>
        }
      </tr>
    );
  },
};
