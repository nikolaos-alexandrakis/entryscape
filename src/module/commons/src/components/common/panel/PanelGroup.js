import m from 'mithril';
import CollapsablePanel from './CollapsablePanel';
import Title from './../Title';


/**
 * TODO this just a wrapper, not ready to be universally
 * A simple list component based on css grid
 * @see ./PanelGroup.md
 */
const PanelGroup = {
  /**
   * @param {Array} columns - An array containing the list items
   * @param {Array} classNames [classNames=[]] - Class names to be added to the list wrapper, e.g
   * ['class1, 'class2', ...]
   */
  view(vnode) {
    const {panels, title, subtitle, hx = 'h3', classNames = [], button} = vnode.attrs;

    return m('.panel-group', {
      class: classNames.join(),
      role: 'tablist',
      'aria-multiselectable': true,
    }, [
      title ? m(Title, {title, subtitle, hx, button}) : null,
      panels.map(panel => m(CollapsablePanel, {panel})),
    ]);
  },
};

export default PanelGroup;
