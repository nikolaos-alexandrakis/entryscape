import HeaderDialog from 'commons/dialog/HeaderDialog';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import config from 'config';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import { renderingContext } from 'rdforms';
import template from './GeonamesChooserTemplate.html';

const username = 'metasolutions'; // TODO @valentino this should be moved to config
const APIconfig = {
  startId: '6295630', // World
  URIPrefix: 'http://sws.geonames.org/',
  hierarchyURL: `http://api.geonames.org/hierarchyJSON?userName=${username}&lang=en&geonameId=`,
  childrenURL: `http://api.geonames.org/childrenJSON?userName=${username}&lang=en&geonameId=`,
  geonameURL: `http://api.geonames.org/getJSON?userName=${username}&lang=en&geonameId=`,
};

const getHierarchy = (geonameId) => {
  const url = `${APIconfig.hierarchyURL}${geonameId}`;
  return registry.get('entrystore').loadViaProxy(url).then(results => results.geonames);
};

const getChildren = (geonameId) => {
  const url = `${APIconfig.childrenURL}${geonameId}`;
  return registry.get('entrystore').loadViaProxy(url).then(results => results.geonames);
};
// NOT USED
// const getGeoname = (geonameId) => {
//   const url = `${APIconfig.geonameURL}${geonameId}`;
//   return registry.get('entrystore').loadViaProxy(url);
// };

const getGeonameId = uri => uri.substr(APIconfig.URIPrefix.length).replace(/\/$/g, '');

const getGeonameURI = geonameId => `${APIconfig.URIPrefix}${geonameId}`;

const GeonamesChooser = declare([_WidgetBase, _TemplatedMixin,
  _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: template,
  binding: null,
  onSelect: null,
  nlsBundles: [{ escoRdforms }],

  postCreate() {
    this.dialog = new HeaderDialog({}, this.dialog);
    this.ownerDocumentBody.appendChild(this.domNode);
    APIconfig.startId = config.itemstore && config.itemstore.geonamesStart != null
      ? config.itemstore.geonamesStart : APIconfig.startId;
    APIconfig.URIPrefix = config.itemstore && config.itemstore.geonamesURIPrefix != null
      ? config.itemstore.geonamesURIPrefix : APIconfig.URIPrefix;
    APIconfig.hierarchyURL = config.itemstore && config.itemstore.geonamesHierarchyURL != null
      ? config.itemstore.geonamesHierarchyURL : APIconfig.hierarchyURL;
    APIconfig.childrenURL = config.itemstore && config.itemstore.geonamesChildrenURL != null
      ? config.itemstore.geonamesChildrenURL : APIconfig.childrenURL;
    APIconfig.geonameURL = config.itemstore && config.itemstore.geonamesGeonameURL != null
      ? config.itemstore.geonamesGeonameURL : APIconfig.geonameURL;
    this.inherited('postCreate', arguments);
  },

  localeChange() {
  },

  setCurrent(geoObj) {
    this.currentGeoObj = geoObj;
    this.name.innerHTML = geoObj.name;
    this.pop.innerHTML = geoObj.population;
    this.lat.innerHTML = geoObj.lat;
    this.lng.innerHTML = geoObj.lng;
    this.subdivision.innerHTML =
      i18n.renderNLSTemplate(this.NLSLocalized0.geoNameSubdivision, { 1: geoObj.name });
  },

  focusOn(geonameId) {
    this.path.innerHTML = '';
    this.list.innerHTML = '';
    getHierarchy(geonameId).then((hierarchy) => {
      hierarchy.forEach((p) => {
        if (p.geonameId === geonameId) {
          const newLi = DOMUtil.create('li', null, this.path);
          newLi.classList.add('active');
          newLi.innerHTML = p.name;
        } else {
          const li = DOMUtil.create('li', null, this.path);
          const a = DOMUtil.create('a', { href: '#', innerHTML: p.name }, li);
          a.onclick = (e) => {
            this.focusOn(p.geonameId);
            e.preventDefault();
            e.stopPropagation();
          };
        }
      }, this);
      if (hierarchy.length > 0) {
        this.setCurrent(hierarchy[hierarchy.length - 1]);
      }
    });
    getChildren(geonameId).then((children) => {
      children.forEach((p) => {
        const a = DOMUtil.create('a', {
          href: '#',
          innerHTML: p.name,
          class: 'list-group-item',
        }, this.list);
        a.onclick = (e) => {
          this.focusOn(p.geonameId);
          e.preventDefault();
          e.stopPropagation();
        };
      }, this);
    });
  },

  select() {
    const choice = {
      value: getGeonameURI(this.currentGeoObj.geonameId),
      label: { en: this.currentGeoObj.name },
      inlineLabel: true,
    };
    this.onSelect(choice);
    this.dialog.hide();
  },
  show(binding, onSelect) {
    // choice.inlineLabel
    this.binding = binding;
    this.onSelect = onSelect;
    if (binding.getValue() === '') {
      this.focusOn(APIconfig.startId);
    } else {
      this.focusOn(getGeonameId(binding.getValue()));
    }
    this.dialog.show();
  },
});

let defaultRegistered = false;
let gChooser = null;

const init = () => {
  if (gChooser == null) {
    gChooser = new GeonamesChooser();
    gChooser.startup();
  }
};

const ext = {
  getChoice(entry, value) {
    init();
    const obj = {
      value,
      load(onSuccess) {
        const async = registry.get('asynchandler');
        async.addIgnore('loadViaProxy', async.codes.GENERIC_PROBLEM, true);
        getHierarchy(getGeonameId(value)).then((result) => {
          if (result.length > 0 && result[result.length - 1].name) {
            obj.label = { en: result[result.length - 1].name };
            return obj;
          }
          throw Error('Damn');
        }).then(onSuccess, () => {
          obj.label = { en: obj.value };
          obj.mismatch = true; // TODO replace with something else
          onSuccess();
        });
      },
    };
    if (registry.get('authorizedUser') == null) {
      delete obj.load;
      obj.label = { en: obj.value };
    }
    return obj;
  },
  show(binding, onSelect) {
    init();
    gChooser.show(binding, onSelect);
  },
  registerDefaults() {
    if (!defaultRegistered) {
      defaultRegistered = true;
      renderingContext.chooserRegistry.predicate('http://purl.org/dc/terms/spatial').register(ext);
      renderingContext.chooserRegistry.constraint({
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.geonames.org/ontology#Feature',
      }).register(ext);
    }
  },
  chooser: GeonamesChooser,
};

export default ext;
