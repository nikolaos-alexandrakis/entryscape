import m from 'mithril';
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
      <div className="statement__row">
        <div className="statement__subject">{statement.getSubject()}</div>
        <div className="statement__predicate">{statement.getPredicate()}</div>
        <div className="statement__object">{statement.getValue()}</div>
      </div>
    );
  },
};
