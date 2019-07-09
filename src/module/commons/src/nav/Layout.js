import Settings from 'commons/nav/Settings';
import escoLayout from 'commons/nls/escoLayout.nls';
import escoModules from 'commons/nls/escoModules.nls';
import registry from 'commons/registry';
import config from 'config';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import declare from 'dojo/_base/declare';
import has from 'dojo/has';
import { i18n, NLSMixin } from 'esi18n';
import m from 'mithril';
import PubSub from 'pubsub-js';
import configUtil from '../util/configUtil';
import DOMUtil from '../util/htmlUtil';
import * as siteUtil from '../util/siteUtil';
import Breadcrumb from './components/Breadcrumb';
import Logo from './components/Logo';
import Menu from './components/Menu';
import './entryscape.scss';
import './layout.scss';
import template from './LayoutTemplate.html';
import Signin from './Signin'; // In template
import utils from './utils';

export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: template,
  _entry2label: {},
  nlsBundles: [{ escoLayout }, { escoModules }],
  _firstLoad: true,
  bid: 'layout',

  /**
   * Subscribe to the view change and re-render before each view change
   *
   * @param {*} params
   */
  constructor(params) {
    this.site = params.site; // TODO @valentino perhaps registry.getSiteManager() is enough

    PubSub.subscribe('spa.beforeViewChange', (res, args) => {
      const { switchingToView, switchingToParams } = args;
      this.show.call(this, switchingToView, switchingToParams);
    });
  },

  postCreate() {
    this.inherited('postCreate', arguments);

    this.settingsDialog = new Settings({}, this.settingsDialog);

    this.menu = new Menu();
    this.signin = new Signin();
    this.signinDialog = new Signin.Dialog({}, DOMUtil.create('div', null, this.domNode));
    document.body.classList.add('spaSite');
    document.body.classList.add('spaFullscreen');

    this.signOutButtonClicked = false;

    this.renderLogo();
    this.renderFooterLogo();

    if (config.theme && config.theme.oneRowNavbar) {
      this.crumbList = this.crumbListSingle;
      this.tabList = this.tabListSingle;
    }

    this.constructFooter();

    registry.onInit('siteManager').then(() => {
      this.hideForPublicView();
      //       if (registry.getSiteConfig().modules && registry.getSiteConfig().modules.length > 1) {
      //         this.showNode(this.menuListNode);
      //       }
      if (registry.getSiteConfig().startView) {
        const site = registry.getSiteManager();
        this.home.setAttribute('href', site.getViewPath(registry.getSiteConfig().startView));
      }
    });

    if (config.theme && config.theme.showCurrentContext) {
      this.showNode(this.contextLabelWrapper);
    }

    if (config.theme && config.theme.showHelpInfo) {
      this.showNode(this.helpInfoFooter);
      this.showNode(this.helpInfoDropdown);
    }


    if (config.theme && config.theme.feedbackViaJira) {
      const fb = this.feedbackButton;
      window.ATL_JQ_PAGE_PROPS = {
        triggerFunction(showCollectorDialog) {
          fb.onclick = (e) => {
            e.preventDefault();
            showCollectorDialog();
          };
        },
      };
      this.showNode(this.feedback);
      require([config.theme.feedbackViaJira]);
    }
    this.manageUserLayout();
    registry.onChange('userEntryInfo', (user) => {
      this.manageUserLayout(user);
    });
    registry.onChange('context', (context) => {
      if (config.theme && config.theme.showCurrentContext) {
        const rdfutils = registry.get('rdfutils');
        if (context != null) {
          const async = registry.get('asynchandler');
          const es = context.getEntryStore();
          const ac = 'contextInHeadCheck';
          async.addIgnore(ac, async.codes.GENERIC_PROBLEM, true);
          es.getEntry(context.getEntryURI(), { asyncContext: ac })
            .then((contextEntry) => {
              const lbl = rdfutils.getLabel(contextEntry) || context.getId();
              this.contextLabel.innerHTML = lbl;
              this.contextLabel.setAttribute('title', lbl);
            });
        } else {
          this.contextLabel.innerHTML = '';
          this.contextLabel.setAttribute('title', '');
        }
      }
    }, true);

    const locale2flag = {};
    config.locale.supported.forEach((l) => {
      locale2flag[l.lang] = l.flag;
      const li = DOMUtil.create('li', { title: l.labelEn }, this.langListNode);
      const a = DOMUtil.create('a', null, li);
      const span = DOMUtil.create('span', null, a);
      span.classList.add('flag-icon');
      span.classList.add(`flag-icon-${l.flag}`);
      DOMUtil.create('span', null, a).innerHTML = `&nbsp;&nbsp;${l.label}`;
      a.onclick = () => registry.set('locale', l.lang);
    }, this);
    // setting dialog is also shown by clicking user name
    const openSettingsDialog = this.settingsDialog.show.bind(this.settingsDialog);
    this.settingsButton.onclick = openSettingsDialog;
    this.settingsButtonFooter.onclick = openSettingsDialog;

    this.signOutButton.onclick = () => {
      this.signOutButtonClicked = true;
      this.signin.signout();
      PubSub.subscribe('app.signout', () => {
        const site = registry.getSiteManager();
        this.destroyComponents();
        this.destroyComponent(this.menuListNode);

        // remove other params, only view should be passed.
        site.render(registry.getSiteConfig().startView || registry.getSiteConfig().signinView, {});
        this.signOutButtonClicked = false;
      });
    };

    registry.onChange('locale', (l) => {
      if (this._currentLocale) {
        this.flagNode.classList.remove(`flag-icon-${locale2flag[this._currentLocale]}`);
      }
      this.flagNode.classList.add(`flag-icon-${locale2flag[l]}`);
      this._currentLocale = l;
    }, true);

    this.privacyPolicyButton.onclick = () => {
      registry.get('signUpDialog').showPULInfoDialog();
    };
    this.privacyPolicyButton_footer.onclick = () => {
      registry.get('signUpDialog').showPULInfoDialog();
    };
  },
  renderLogo() {
    const logoInfo = configUtil.getLogoInfo();
    m.render(this.home, m(Logo, logoInfo));
  },
  renderFooterLogo() {
    const logoInfo = configUtil.getLogoInfo('icon');
    logoInfo.isFooter = true;
    m.render(this.logoNodeFooter, m(Logo, logoInfo));
  },
  constructFooter() {
    if (config.theme && config.theme.footer && config.theme.footer.text) {
      const footerText = config.theme.footer.text[`${i18n.getLocale()}`];
      if (footerText != null) {
        this.footerText.innerHTML = footerText;
      } else if (config.theme.footer.text.en != null) {
        this.footerText.innerHTML = config.theme.footer.text.en;
      } else {
        this.footerText.innerHTML = '';
      }
    }
    if (config.theme && config.theme.footer && config.theme.footer.buttons) {
      const localize = registry.get('localize');
      this.footerButtons.innerHTML = '';
      config.theme.footer.buttons.forEach((fButton) => {
        const label = localize(fButton.label);
        const title = localize(fButton.title);
        const a = DOMUtil.create('a', {
          type: 'button',
          href: fButton.link,
        }, this.footerButtons);
        DOMUtil.addClass(a, 'bottom_footer_button btn btn-raised btn-link btn-sm');

        if (fButton.faIcon) {
          DOMUtil.create('span', null, a).classList.add(`fas fa-${fButton.faIcon}`);
        }
        a.setAttribute('title', title);
        DOMUtil.create('span', null, a).innerHTML = label;

        if (fButton.link.indexOf('http') === 0) {
          a.classList.add('spaExplicitLink');
          a.setAttribute('target', '_blank');
        } else {
          a.onclick = (event) => {
            event.stopPropagation();
            event.preventDefault();
            registry.get('dialogs').acknowledgeText(fButton.link, title);
          };
        }
      }, this);
    }
  },
  /**
   *
   * @param viewName
   * @return {Object}
   */
  getNavBarInfo(viewName) {
    const siteConfig = this.site.getConfig();
    let views = [];
    let wideSidebar;
    const alwaysSidebar = (siteConfig.sidebar && siteConfig.sidebar.always);
    const alwaysWideSidebar = siteConfig.sidebar && siteConfig.sidebar.wide === true;
    const onlySidebar = false;
    const viewDef = this.site.getViewDef(viewName);
    const module = siteUtil.getModuleOfView(viewName);

    if (viewDef.parent) {
      views = siteUtil.getSubviewsOfView(viewDef.parent);
      views = siteUtil.filterViewsByAttribute(views, 'navbar');
      if (views.length > 0 && (module.sidebar || alwaysSidebar)) {
        wideSidebar = module.wideSidebar;
      }
    } else if (module) {
      const viewsArray = siteUtil.getTopLevelViewsOfModule(module, viewDef, true);
      views = (viewsArray.length > 1) ? viewsArray : [viewDef];
    } else {
      views = [viewDef];
    }

    return {
      show: views.length > 1,
      views: views || [],
      wide: wideSidebar === true || alwaysWideSidebar,
      alone: onlySidebar,
    };
  },
  manageUserLayout(user = null) {
    if (registry.getSiteConfig().public) {
      return;
    }
    if (registry.get('userInfo').id === '_guest' || window.queryParamsMap.publicView) {
      this.hideNode(this.userDetails);
      this.showNode(this.guestDetails);
      this.hideNode(this.menuListNode);
      this.hideNode(this.sidebarFooter);
    } else {
      this.showNode(this.userDetails);
      this.hideNode(this.guestDetails);
      if (user) {
        this.userName.innerHTML = user.displayName;
        this.userProfile.setAttribute('title', user.displayName);
      } else {
        registry.onInit('userEntryInfo').then((usr) => {
          this.userName.innerHTML = usr.displayName;
        });
      }

      // show in case they were hidden for public view and then user signed-in
      this.showNode(this.menuListNode);
      this.showNode(this.sidebarFooter);
    }
  },
  hideForPublicView() {
    const site = registry.getSiteManager();
    const module = site.getSelectedModule();
    if (module && module.public) {
      registry.onInit('userEntryInfo').then((info) => {
        if (info.entryId === '_guest') {
          // hide side menu
          this.hideNode(this.menuListNode);
          // hide side footer
          this.hideNode(this.sidebarFooter);
          // show breadcrumb
          this.showNode(this.allBreadcrumbs);
        }
      });
    }
  },
  getCurrentModuleName() {
    const site = registry.getSiteManager();
    const module = site.getSelectedModule();

    if (module && 'productName' in module) {
      return module.productName;
    }
    return this.getModuleStr('title', module);
  },
  getModuleStr(prop, module = null) {
    return module ? utils.getModuleProp(module, this.NLSLocalized1, prop) : '';
  },
  localeChange() {
    if (this._firstLoad === true) {
      this._firstLoad = false;
      // TODO @scazan figure out 'has'
      if (!(has('chrome') >= 57 || has('ff') > 60 || has('ie') >= 11
        || has('trident') || has('edge') || has('safari') >= 8)) {
        registry.get('dialogs')
          .acknowledge(this.NLSLocalized0.unSupportedBrowser, this.NLSLocalized0.continueUnsupportedBrowser);
      }
    }

    this.renderLogo();
    this.constructFooter();
  },
  show(viewName, params) {
    this.inherited('show', arguments);
    const siteConfig = registry.getSiteConfig();
    if (viewName === siteConfig.signinView) {
      this.destroyComponent(this.menuListNode);
      this.showNode(this.privacyMenu);
    } else {
      const userEntry = registry.get('userEntry');
      if (userEntry && userEntry.getId() !== '_guest') {
        this.mountComponent(this.menu, this.menuListNode);
      }
      this.hideNode(this.privacyMenu);
    }

    this.tabList.innerHTML = '';
    this.hideNode(this.tabList);
    this.hideNavBar();
    const nvi = this.getNavBarInfo(viewName);
    if (viewName === registry.getSiteConfig().startView || nvi.alone ||
      (config.theme && config.theme.oneRowNavbar)) {
      this.containerNode.classList.remove('spaTwoMenu');
      this.destroyComponents();
    } else {
      this.containerNode.classList.add('spaTwoMenu');
    }

    if (nvi.show) {
      this.showNavBar(nvi, viewName, params);
    }

    const site = registry.getSiteManager();
    const module = site.getSelectedModule();
    if (module == null || nvi.alone) {
      document.title = utils.decodeHtml(configUtil.getAppName());
      return;
    }

    const upcomingView = site.getUpcomingOrCurrentView();
    const upcomingViewDef = site.getViewDef(upcomingView);
    const viewsPathArr = siteUtil.getBreadcrumbViews(upcomingViewDef);
    const breadcrumbItems = [];
    if (module.asCrumb) {
      breadcrumbItems.push(this.createModuleCrumb(params));
    }
    viewsPathArr.forEach((viewN) => {
      const viewDef = site.getViewDef(viewN);
      if (viewDef.hidden === true) {
        return;
      }

      if (viewsPathArr.length > 0) {
        const authorizedUser = registry.get('authorizedUser');
        if (authorizedUser && !this.signOutButtonClicked) {
          breadcrumbItems.push(this.createCrumb(viewDef, viewName, params));
        }
      } else { // TODO not sure if this is relevant any more?
        this.createTab(viewDef, viewName, params);
      }
    }, this);

    //        let lastArrIdx = viewsPathArr.length - 1;
    Promise.all(breadcrumbItems).then((items) => {
      const currentView = registry.get('siteManager').getCurrentView();
      const signInView = registry.getSiteConfig().signinView;
      // if we are in a view or transition into a view that is not the sign in view then show the breadcrumb
      if (((currentView && currentView !== signInView) || upcomingView !== signInView) && items.length > 0) {
        this.showBreadcrumb(items);
        this.updateWindowTitle(items[items.length - 1].value); // update window title
      }
    });
  },
  hideNode(node) {
    node.style.display = 'none';
  },
  showNode(node) {
    node.style.display = '';
  },
  updateWindowTitle(label) {
    const mname = this.getCurrentModuleName();
    const context = registry.get('context');
    if (context) {
      context.getEntry().then((centry) => {
        const cname = registry.get('rdfutils').getLabel(centry);
        if (label === cname) {
          document.title = utils.decodeHtml(`${label} - EntryScape ${mname}`);
        } else {
          document.title = utils.decodeHtml(`${label} - ${cname} - EntryScape ${mname}`);
        }
      });
    } else {
      document.title = utils.decodeHtml(`${label} - EntryScape ${mname}`);
    }
  },
  destroyComponents() {
    this.hideBreadcrumb();
  },
  mountComponent(component, mountNode) {
    this.showNode(mountNode);
    m.mount(mountNode, component);
  },
  destroyComponent(mountNode) {
    this.hideNode(mountNode);
    m.mount(mountNode, null);
  },
  showBreadcrumb(items) {
    this.showNode(this.crumbList);
    m.render(this.crumbList, m(Breadcrumb, { items }));
  },
  hideBreadcrumb() {
    this.destroyComponent(this.crumbList);
  },
  hideNavBar() {
    this.hideNode(this.controllerViewList);
    this.viewsNode.classList.add('col-md-12');
    this.viewsNode.classList.remove('col-md-11');
  },
  showNavBar(nvi, viewName, params) {
    this.controllerViewList.innerHTML = '';
    this.showNode(this.controllerViewList);
    const site = registry.getSiteManager();
    nvi.views.forEach((viewDef) => {
      const isSelected = viewDef.name === viewName;

      const li = DOMUtil.create('li', {class:'nav-item'}, this.controllerViewList);
      if (isSelected) {
        li.classList.add('selected');
      }

      const a = DOMUtil.create('a', null, li);
      if (!isSelected) {
        a.setAttribute('href', site.getViewPath(viewDef.name, params));
      }
      const titleNode = DOMUtil.create('span', null, a);
      utils.setViewLabelAndTooltip(titleNode, a, viewDef.name, params);
    }, this);
  },
  createTab(viewDef, currentViewName, params) {
    const li = DOMUtil.create('li', null, this.tabList);
    const a = DOMUtil.create('a', {
      href: this.site.getViewPath(viewDef.name, params),
    }, li);
    a.classList.add(`${viewDef.name}`);
    a.classList.add('spaTab');

    utils.setViewLabelAndTooltip(a, li, viewDef.name, params);
    if (viewDef.name === currentViewName) {
      li.classList.add('active');
    }
    return li;
  },
  createModuleCrumb(params) {
    const site = registry.getSiteManager();
    const module = site.getSelectedModule(); // there should be always a module if you are rendering breadcrumbs
    const href = this.site.getViewPath(module.startView, params);
    const className = 'active';
    const label = utils.getViewProp(module, 'title');
    const value = label.replace('&shy;', '\u00AD');
    return Promise.resolve({ value, className, href });
  },
  createCrumb(viewDef, currentViewName, params) {
    let href = '';
    let className = '';

    if (viewDef.name === currentViewName) {
      className = 'active';
    } else if (viewDef.labelCrumb === true) {
      className = 'crumbPath';
    } else {
      href = this.site.getViewPath(viewDef.name, params);
    }

    return utils.getViewLabel(viewDef.name, params)
      .then((label) => {
        // replace HTML code to Unicode for mithril
        const value = label.replace('&shy;', '\u00AD');
        return { value, className, href };
      });
  },
});
