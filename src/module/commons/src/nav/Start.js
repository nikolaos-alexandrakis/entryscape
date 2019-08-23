import config from 'config';
import { utils as rdformsUtils } from 'rdforms';
import registry from 'commons/registry';
import { NLSMixin } from 'esi18n';
import escoModules from 'commons/nls/escoModules.nls';
import escoLayout from 'commons/nls/escoLayout.nls';
import declare from 'dojo/_base/declare';
import Cards from './Cards';
import ViewMixin from '../view/ViewMixin';
import DOMUtil from '../util/htmlUtil';
import utils from './utils';

export default declare([Cards, ViewMixin, NLSMixin.Dijit], {
  nlsBundles: [{ escoModules }, { escoLayout }],

  postCreate() {
    this.inherited('postCreate', arguments);
    registry.onChange('hasAdminRights', () => {
      this.show();
    });

    registry.onChange('userEntryInfo', (info) => {
      if (this.signInNode) {
        this.updateBannerButtonsVisibility(info.entryId === '_guest');
      }
    });
  },

  updateBannerButtonsVisibility(visible) {
    if (visible) {
      this.signInNode.style.display = '';
    } else {
      this.signInNode.style.display = 'none';
    }
  },

  show() {
    this.render();
  },
  localeChange() {
    if (this.signInNode) {
      this.signInNode.innerHTML = this.NLSLocalized1.signInFromBanner;
    }
    this.show();
  },

  getBannerNode() {
    let node;
    if (config.theme && config.theme.startBanner) {
      const sb = config.theme.startBanner;
      let txt;
      node = DOMUtil.create('div');
      node.classList.add('square-service-block');
      node.classList.add('entryscape-intro');

      if (sb.header) {
        txt = rdformsUtils.getLocalizedValue(sb.header).value;
        DOMUtil.create('h2', null, node).innerHTML = txt;
      }
      if (sb.icon) {
        DOMUtil.create('img', { src: sb.icon }, node).style.marginBottom = '30px';
      }
      if (sb.text) {
        txt = rdformsUtils.getLocalizedValue(sb.text).value;
        const newP = DOMUtil.create('p', null, node);
        newP.innerHTML = txt;
        newP.classList.add('font-size-large');

        if (sb.details) {
          // Filler button for right height.
          const newButton = DOMUtil.create('button', null, node);

          newButton.classList.add('btn');
          newButton.classList.add('btn-success');
          newButton.innerHTML = 'F';
          newButton.style.visibility = 'hidden';

          const de = sb.details;
          txt = rdformsUtils.getLocalizedValue(de.buttonLabel).value;
          const but = DOMUtil.create('button', {}, node);
          but.classList.add('btn');
          but.classList.add('btn-raised');
          but.classList.add('btn-secondary');
          but.classList.add('float-right');
          but.innerHTML = txt;

          txt = rdformsUtils.getLocalizedValue(de.header).value;
          but.onclick = () => {
            registry.get('dialogs').acknowledgeText(de.path, txt);
          };
        }
        this.signInNode = DOMUtil.create('button', null, node);
        // @scazan adding classes separately because of IE 11 compatability
        this.signInNode.classList.add('btn');
        this.signInNode.classList.add('btn-raised');
        this.signInNode.classList.add('btn-success');
        this.signInNode.classList.add('float-right');

        if (this.NLSLocalized1) {
          this.signInNode.innerHTML =
            this.NLSLocalized1.signInFromBanner;
        }
        this.signInNode.onclick = () => {
          const spa = registry.getSiteManager();
          // remove other params, only view should be passed.
          spa.render(registry.getSiteConfig().signinView || 'signin', {});
        };
        const uei = registry.get('userEntryInfo');
        this.updateBannerButtonsVisibility(uei == null || uei.entryId === '_guest');
      }
    } else {
      node = DOMUtil.create('div');
    }
    return node;
  },

  getBannerInfo() {

  },

  /**
   * Essentially maps the modules Map to an Array of module definitions
   * @return {Array}
   */
  getCards() {
    const site = registry.getSiteManager();
    return Array.from(site.modules).map(([, module]) => module);
  },

  getLabelAndTooltip(card) {
    let tooltip;
    const pt = card.productName;

    const label = utils.getModuleProp(card, this.NLSLocalized0, 'title');
    if (label) {
      tooltip = `EntryScape ${pt}`;
    } else {
      tooltip = utils.getModuleProp(card, this.NLSLocalized0, 'tooltip');
    }

    return { label, tooltip };
  },

  setLabelAndTooltip(labelNode, tooltipNode, card) {
    const { label, tooltip } = this.getLabelAndTooltip(card);

    labelNode.innerHTML = label;
    tooltipNode.setAttribute('title', tooltip);
  },

  getText(card) {
    return utils.getModuleProp(card, this.NLSLocalized.escoModules, 'text', true);
  },
  setText(textNode, card) {
    const text = this.getText(card);
    textNode.innerHTML = text || '';
  },
});
