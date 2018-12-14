import m from 'mithril';
import registry from 'commons/registry';
import Position from './Position';
import Map from './Map';
import utils from '../utils';

export default (params) => {
  const { binding, bundle } = params.attrs;

  let state = {
    inputsFocused: false,
    coords: null,
  };

  const setState = (props) => {
    state = { ...state, ...props };
    m.redraw();

    return state;
  };

  const updateGeoCoordinates = (coords) => {
    binding.setValue(coords);
    setState({ coords });
    return true;
  };

  const unfocusInputs = () => {
    setState({ inputsFocused: false });
  };
  const focusInputs = () => {
    setState({ inputsFocused: true });
  };

  let detectClick;
  let detectLabel;
  const geoDetect = registry.get('itemstore').geoDetect;
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
