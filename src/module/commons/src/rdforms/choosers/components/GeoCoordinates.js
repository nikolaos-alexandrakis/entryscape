/* global define*/
import m from 'mithril';
import Position from './Position';
import Map from './Map';
import registry from 'commons/registry';
import {engine} from 'rdforms';
import utils from '../utils';
import config from 'config';

const GeoCoordinates = vnode => {
  const {binding, editable, bundle} = vnode.attrs;

  const updateGeoCoordinates = coords => {
    binding.setValue(coords);
    m.redraw();
    return true;
  };

  const state = {
    inputsFocused: false
  };

  const unfocusInputs = () => state.inputsFocused = false;
  const focusInputs = () => state.inputsFocused = true;
  let detectClick;
  let detectLabel;
  const geoDetect = config.itemstore.geoDetect;
  if (geoDetect) {
    const dialogs = defaults.get('dialogs');
    const localize = defaults.get('localize');
    detectLabel = localize(geoDetect.detectLabel);
    detectClick = () => {
      geoDetect.detect(defaults.get('entrystore'), binding).then((response) => {
        const {geo, message} = response;
        if (typeof geo === 'object') {
          updateGeoCoordinates(utils.toWKT(geo));
        }
        if (typeof message === 'object') {
          dialogs.acknowledge(localize(message), localize(geoDetect.okLabel));
        }
      }, (err) => {
        if (typeof err === 'object') {
          dialogs.acknowledge(localize(err), localize(geoDetect.okLabel));
        }
      });
    };
  }


  const component = {
    view(vnode) {
      const {value, editable} = vnode.attrs;

      return m('div', null, [
        m(Position, {
          editable,
          value: binding.getValue(),
          bundle,
          updateGeoCoordinates,
          focusInputs,
          inputsFocused: state.inputsFocused,
          detectClick,
          detectLabel,
        }),
        m(Map, {editable, value: binding.getValue(), updateGeoCoordinates, unfocusInputs}),
      ]);
    },
  };

  return component;
};

export {GeoCoordinates};
export default GeoCoordinates;
