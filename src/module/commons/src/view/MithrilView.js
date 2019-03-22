import m from 'mithril';
import declare from 'dojo/_base/declare';
import ViewMixin from './ViewMixin';

/**
 * @todo make es6 class
 */
export default declare(ViewMixin, {
  constructor(params, domNode) {
    // @todo @valentino pass the params to the mithril view
    this.domNode = domNode;
  },
  mainComponent: null,
  /**
   * this method is expected by spa/Site
   */
  show() {
    m.mount(this.domNode, this.mainComponent);
  },
});
