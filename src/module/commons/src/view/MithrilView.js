import m from 'mithril';
import declare from 'dojo/_base/declare';
import ViewMixin from './ViewMixin';

/**
 * @todo make es6 class
 */
export default declare(ViewMixin, {
  mainComponent: null,
  /**
   * @todo @valentino check how and if viewDef.node should be utilized
   * this method is expected by spa/Site
   */
  show() {
    // attach this component to the main viewsNode
    m.mount(document.getElementById('viewsNode'), this.mainComponent);
  },
});
