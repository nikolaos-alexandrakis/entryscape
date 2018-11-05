import m from 'mithril';
import GeoCoordinates from './components/GeoCoordinates';
import {renderingContext} from 'rdforms';
import { i18n } from 'esi18n';
import registry from 'commons/registry';
import escoRdforms from 'commons/nls/escoRdforms.nls';

let defaultRegistered = false;

const GeoChooser = {
  editor(node, binding, context) {
    const bundle = i18n.getLocalization(escoRdforms);
    m.mount(node, {view: () => m(GeoCoordinates, {binding, editable: true, bundle})});
  },
  presenter(node, binding, context) {
    i18n.getLocalization(escoRdforms);
    m.mount(node, {view: () => m(GeoCoordinates, {binding, editable: false, bundle})});
  },
  registerDefaults() {
    if (!defaultRegistered) {
      defaultRegistered = true;

      renderingContext.editorRegistry
        .datatype('http://www.opengis.net/ont/geosparql#wktLiteral')
        .register(GeoChooser.editor);
      renderingContext.presenterRegistry
        .datatype('http://www.opengis.net/ont/geosparql#wktLiteral')
        .register(GeoChooser.presenter);
    }
  },
};

export default GeoChooser;
