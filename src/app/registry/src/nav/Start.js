import GroupComponent from 'commons/components/common/Group';
import Start from 'commons/nav/Start';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import m from 'mithril';
import CardComponent from './components/CardComponent';
import './esreStart.scss';

export default declare([Start], {
  bid: 'esreStart',

  render() {
    this.renderBanner();
    const site = registry.getSiteManager();
    const cardsComponents = this.getCards().map((card) => {
      const cardView = this.getCardView(card);
      const text = this.getText(card);
      let onclick;
      const { label, tooltip } = this.getLabelAndTooltip(card);
      if (cardView != null) {
        const viewDef = site.getViewDef(cardView);
        const params = Object.assign({}, this.viewParams || {}, viewDef.showParams || {});
        onclick = () => registry.get('siteManager').render(cardView, params);
      }

      return m(CardComponent, {
        text,
        tooltip,
        onclick,
        title: label,
        id: this.bid,
        faClass: card.faClass,
      });
    }, this);

    m.render(this.mainNode, m(GroupComponent, { components: cardsComponents }));
  },

  // TODO change in commons so this is not neccessary
  getBannerNode() {
    const node = this.inherited(arguments);
    node.classList.remove('jumbotron');
    node.classList.add('card');
    return node;
  },
  canShowView() {
    return new Promise(resolve => resolve(true));
  },
});
