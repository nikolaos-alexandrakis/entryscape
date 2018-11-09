import registry from 'commons/registry';
import config from 'config';
import m from 'mithril';
import utils from '../utils';
import Map from './Map';
import Position from './Position';

export default (params) => {
  const { binding, bundle } = params.attrs;

  const updateGeoCoordinates = (coords) => {
    binding.setValue(coords);
    m.redraw();
    return true;
  };

  const state = {
    inputsFocused: false,
  };

  const unfocusInputs = () => {
    state.inputsFocused = false;
  };
  const focusInputs = () => {
    state.inputsFocused = true;
  };
  let detectClick;
  let detectLabel;
  const geoDetect = config.itemstore.geoDetect;
  if (geoDetect) {
    const dialogs = registry.get('dialogs');
    const localize = registry.get('localize');
    detectLabel = localize(geoDetect.detectLabel);
    detectClick = () => {
      geoDetect.detect(registry.get('entrystore'), binding).then((response) => {
        const { geo, message } = response;
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
      const { editable } = vnode.attrs;

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
        m(Map, { editable, value: binding.getValue(), updateGeoCoordinates, unfocusInputs }),
      ]);
    },
  };

  return component;
};
