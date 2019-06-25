import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import utils from './utils';
import ViewMixin from '../view/ViewMixin';
import templateString from './CardsTemplate.html';
import DOMUtil from '../util/htmlUtil';
import './cards.css';

export default declare([_WidgetBase, _TemplatedMixin, ViewMixin], {
  templateString,
  textWithCards: true,

  render() {
    this.mainNode.innerHTML = '';
    const site = registry.getSiteManager();
    this.renderBanner();
    if (this.textWithCards) {
      this.mainNode.classList.add('textWithCards');
    }

    const context = this.getContextId();
    this.getCards().forEach(async (card) => {
      const cardView = this.getCardView(card);
      const col = DOMUtil.create('div', null, this.mainNode);
      col.classList.add('col-6');
      col.classList.add('col-sm-6');
      col.classList.add('col-md-4');


      const cardBlock = DOMUtil.create('div', null, col);
      cardBlock.classList.add('square-service-block');
      const a = DOMUtil.create('a', null, cardBlock);
      if (cardView == null) {
        a.classList.add('disabled');
      }

      if (cardView != null) {
        const params = context ? { context } : {};
        a.setAttribute('href', site.getViewPath(cardView, params));
      }
      let titleNode;
      if (this.textWithCards) {
        const div = DOMUtil.create('div', null, a);
        div.classList.add('ssb-icon');

        const i = DOMUtil.create('i', { 'aria-hidden': 'true' }, div);
        DOMUtil.addClass(i, `fa fa-${card.faClass}`);
        titleNode = DOMUtil.create('h2', null, a);
        titleNode.classList.add('ssb-title');
        const textNode = DOMUtil.create('p', null, titleNode);
        textNode.classList.add('font-size-large');
        this.setLabelAndTooltip(titleNode, a, card);
        this.setText(textNode, card);
      } else {
        DOMUtil.create('h2', null, a).innerHTML = `<i class="fa fa-2x fa-${card.faClass}"></i>`;
        titleNode = DOMUtil.create('h3', null, a);
        this.setLabelAndTooltip(titleNode, a, card);
      }
    }, this);
  },

  /**
   * Return context id if context is defined
   * @return {Integer|null}
   */
  getContextId() {
    const context = registry.get('context');
    if (context) {
      return context.getId();
    }

    return null;
  },

  renderBanner() {
    this.bannerNode.innerHTML = '';
    this.bannerNode.appendChild(this.getBannerNode());
  },

  getBannerNode() {
    const newDiv = DOMUtil.create('div');
    newDiv.innerHTML = this.getBannerHTML();

    return newDiv;
  },

  getBannerHTML() {
    this.domNode.classList.add('entryscapeCards--noBanner');
    return '';
  },

  show(params) {
    this.viewParams = params;
    this.render();
  },

  /**
   * For each card definition the following attributes are considered:
   * name - the name for the card
   * view - the name of the view the card should link to.
   * faClass - the font awesome icon to use.
   *
   * @returns {object[]} array of card definitions
   */
  getCards() {
    const views = utils.getSubViews(this.viewParams.view);
    return views.map((v) => {
      if (typeof v.text === 'object') {
        this.textWithCards = true;
      }
      const sm = registry.getSiteManager();
      const viewDef = sm.getViewDef(v);
      return {
        def: viewDef,
        name: v,
        view: v,
        faClass: viewDef != null ? viewDef.faClass : '',
      };
    });
  },

   setLabelAndTooltip(labelNode, tooltipNode, card) {
    utils.setViewLabelAndTooltip(labelNode, tooltipNode, this.getCardView(card), this.viewParams);
  },

  setText(textNode, card) {
    utils.setText(textNode, this.getCardView(card));
  },

  /**
   * Sometimes cards are modules (startView) and others they are views (view)
   * @param card
   * @return {*}
   */
  getCardView(card) {
    return card.view || card.startView;
  },
});
