import EntryRow from 'commons/list/EntryRow';
import declare from 'dojo/_base/declare';
import DOMUtil from '../../util/htmlUtil';
/** To use this EntryRow you must register a row action with the name expand, e.g.:
 *       this.registerRowAction({
 *           name: "expand",
 *           button: "link",
 *           iconType: "fa",
 *           icon: "chevron-right"
 *       });
 *
 *  You also need to implement the initExpandArea member function to initialize
 *  the expand area.
 */

export default declare([EntryRow], {
  expandIcon: 'fa-chevron-down',
  unexpandIcon: 'fa-chevron-up',
  expandTitle: '',
  unexpandTitle: '',
  postCreate() {
    this.inherited(arguments);
    this.initExpandTitles();
    this.buttons.expand.element.setAttribute('title', this.expandTitle);
  },
  initExpandTitles() {
  },
  action_expand() {
    const el = this.buttons.expand.element.firstChild;
    el.classList.toggle(this.expandIcon);
    el.classList.toggle(this.unexpandIcon);
    if (!this.details) {
      this.details = DOMUtil.create('div', null, this.rowNode, 'after');
      this.detailsContainer = DOMUtil.create('div', null, this.details);
      this.detailsContainer.style.display = 'none';
      this.initExpandArea(this.detailsContainer);
    }
    if (this.detailsContainer.style.display === 'none') {
      this.buttons.expand.element.setAttribute('title', this.unexpandTitle);
      jquery(this.detailsContainer).slideDown(300);
    } else {
      this.buttons.expand.element.setAttribute('title', this.expandTitle);
      jquery(this.detailsContainer).slideUp(300);
    }
  },
  initExpandArea(/* node */) {
    // Override
  },
});
