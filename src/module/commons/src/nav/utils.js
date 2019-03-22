import { utils } from 'rdforms';
import registry from 'commons/registry';

const _getSubViewsAsList = (node, arr) => {
  if (node.subViews != null) {
    for (let i = 0; i < node.subViews.length; i++) {
      const sv = node.subViews[i];
      if (typeof sv === 'string') {
        arr.push(sv);
      } else {
        arr.push(sv.view);
        _getSubViewsAsList(sv, arr);
      }
    }
  }
  return arr;
};

const _getSubViews = (node, viewName) => {
  if (node.view === viewName) {
    return _getSubViewsAsList(node, []);
  }
  if (node.subViews != null) {
    for (let i = 0; i < node.subViews.length; i++) {
      const res = _getSubViews(node.subViews[i], viewName);
      if (res != null) {
        return res;
      }
    }
  }

  return null;
};

const getSubViews = (view) => {
  const sm = registry.getSiteManager();
  const config = sm.getConfig();
  const views = [];
  for (let i = 0; i < config.views.length; i++) {
    if (config.views[i].parent === view) {
      views.push(config.views[i].name);
    }
  }
  return views;
};

const navUtils = {
  getModuleProp(module, bundle, prop, allowEmpty) {
    const mn = module.name;
    if (bundle && bundle[`${mn}-${prop}`]) {
      return bundle[`${mn}-${prop}`];
    } else if (module[prop]) {
      return utils.getLocalizedValue(module[prop]).value;
    } else if (allowEmpty !== true) {
      return mn;
    }

    return null;
  },
  getViewProp(view, prop) {
    if (view[prop]) {
      return utils.getLocalizedValue(view[prop]).value;
    }
    return view.name;
  },
  getSubViewDefs(view) {
    const sm = registry.getSiteManager();
    const views = getSubViews(view);
    return views.map(v => sm.getViewDef(v));
  },
  getSubViews,
  /**
   * Returns a promise which when resolved returns the label for a view
   *
   * @param viewParam
   * @param params
   * @return {Promise|*}
   */
  getViewLabel(viewParam, params) {
    let label;
    const site = registry.getSiteManager();
    const viewDef = site.getViewDef(viewParam);

    return new Promise((resolve, reject) => {
      if (typeof viewDef.title === 'undefined') {
        return site.getViewObject(viewDef.name).then((view) => {
          if (view.getViewLabel) {
            view.getViewLabel(viewDef.name, params, (lbl) => {
              if (lbl.length > 12) {
                resolve(`${lbl.substr(0, 12)}…`);
              } else {
                resolve(lbl);
              }
              resolve(lbl);
            });
          } else {
            label = navUtils.getViewProp(viewDef, 'title');
            resolve(label);
          }
        }, () => reject());
      }
      if (typeof viewDef.title === 'string') {
        label = viewDef.title;
      } else if (typeof viewDef.title === 'object') {
        label = utils.getLocalizedValue(viewDef.title).value;
      }
      if (typeof viewDef.tooltip === 'string') {
        label = viewDef.tooltip;
      } else if (typeof viewDef.tooltip === 'object') {
        label = utils.getLocalizedValue(viewDef.tooltip).value;
      }

      return resolve(label || viewDef.name);
    });
  },
  /**
   * TODO rely on getViewLabel
   *
   * @param labelNode
   * @param titleNode
   * @param viewParam
   * @param params
   * @return {*}
   */
  setViewLabelAndTooltip(labelNode, titleNode, viewParam, params) {
    return new Promise((resolve, reject) => {
      let label;
      const site = registry.getSiteManager();
      const viewDef = site.getViewDef(viewParam);
      if (typeof viewDef.title === 'undefined') {
        site.getViewObject(viewDef.name).then((view) => {
          if (view.getViewLabel) {
            view.getViewLabel(viewDef.name, params, (lbl, tooltip) => {
              if (lbl.length > 12) {
                labelNode.innerHTML = `${lbl.substr(0, 12)}…`;
              } else {
                labelNode.innerHTML = lbl;
              }
              if (tooltip) {
                labelNode.setAttribute('title', tooltip);
              }
              resolve(lbl);
            });
          } else {
            label = navUtils.getViewProp(viewDef, 'title');
            labelNode.innerHTML = label;
            resolve(label);
          }
        }, () => reject());
      }
      if (typeof viewDef.title === 'string') {
        label = viewDef.title;
      } else if (typeof viewDef.title === 'object') {
        label = utils.getLocalizedValue(viewDef.title).value;
      }
      if (typeof viewDef.tooltip === 'string') {
        label = viewDef.tooltip;
      } else if (typeof viewDef.tooltip === 'object') {
        label = utils.getLocalizedValue(viewDef.tooltip).value;
      }

      labelNode.innerHTML = label || viewDef.name;
      if (viewDef.tooltip != null) {
        titleNode.setAttribute('title', viewDef.tooltip);
      }
      resolve(label);
    });
  },
  setText(textNode, viewParam) {
    const site = registry.getSiteManager();
    const viewDef = site.getViewDef(viewParam);
    site.getViewObject(viewDef).then((view) => {
      if (view.getViewText) {
        view.getViewText(viewDef.name, params, (text) => {
          textNode.innerHTML = text;
        });
      } else {
        textNode.innerHTML = navUtils.getViewProp(viewDef, 'text');
      }
    });
  },
  decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value.replace('/&shy;/g', '');
  },
};

export default navUtils;
