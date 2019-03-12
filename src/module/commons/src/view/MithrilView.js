import config from 'config';
import m from 'mithril';
import declare from 'dojo/_base/declare';
import ViewMixin from './ViewMixin';

/**
 * @todo make es6 class
 */
export default declare(ViewMixin, {
  mainComponent: null,
  /**
   * this method is expected by spa/Site
   */
  show() {
    const domNode = config.get('viewsNode', document.getElementById('viewsNode'));
    m.mount(domNode, this.mainComponent);
  },
});
