import m from 'mithril';
import './escoGridRowComponent.css';
/**
 * A component for Bootstrap grid Row.
 * @see ./Row.md
 */
export default {
  bid: 'escoGridRowComponent',
  /**
   * @param {Array} columns - An array containing the info about the Boostrap column
   * @param {Array} classNames [classNames=[]] - Any class names to be attached to the outer
   * element for the alert, e.g ['class1, 'class2', ...]
   */
  view(vnode) {
    const { columns, classNames = [] } = vnode.attrs;

    return m('.row', {
      class: classNames.join(),
    }, columns.map(column => m(`.col-md-${column.size}`, { class: `${this.bid}__row` }, column.value)));
  },
};
