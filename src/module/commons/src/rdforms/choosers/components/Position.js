import Button from 'commons/components/common/button/Button';
import { createSetState } from 'commons/util/util';
import m from 'mithril';
import utils from '../utils';

const bid = 'escoPosition';

export default () => {
  let updateGeoCoordinates;
  let focusInputs;
  let state = {
    inputsEditable: false,
    lastClickedDir: undefined,
    bounds: {
      type: undefined,
      north: undefined,
      west: undefined,
      south: undefined,
      east: undefined,
      lat: undefined,
      lng: undefined,
    },
  };

  const setState = createSetState(state);

  const inputFocus = (dir) => {
    state = setState({ lastClickedDir: dir });
    focusInputs();
  };

  const updateGeoCoordinatesState = (direction, value) => {
    const newBounds = state.bounds;
    newBounds[direction] = parseFloat(value);
    state = setState({ bounds: newBounds }, true);

    if (Number.isNaN(parseFloat(value))) {
      return false;
    }

    // Clean state bounds
    Object.entries(state.bounds).forEach((keyVal) => {
      if (keyVal[1] == null || Number.isNaN(keyVal[1])) {
        state.bounds[keyVal[0]] = 0;
      }
    });


    if (state.bounds.type === 'point') {
      const latLng = { lat: state.bounds.lat, lng: state.bounds.lng };
      updateGeoCoordinates(utils.toWKT(utils.convertPointToGeoCoords(latLng)));
    } else {
      updateGeoCoordinates(utils.toWKT(state.bounds));
    }

    return true;
  };
  const inputBlur = (dir, val) => {
    updateGeoCoordinatesState(dir, val);
  };

  const updateBounds = (value) => {
    const bounds = utils.fromWKT(value);
    state.bounds = {
      type: bounds ? bounds.type : undefined,
      north: bounds ? bounds.north : undefined,
      west: bounds ? bounds.west : undefined,
      south: bounds ? bounds.south : undefined,
      east: bounds ? bounds.east : undefined,
      lat: bounds ? bounds.lat : undefined,
      lng: bounds ? bounds.lng : undefined,
    };
  };


  /**
   * A component for showing a map.
   */
  return {
    oninit(vnode) {
      const {
        value,
      } = vnode.attrs;

      updateGeoCoordinates = vnode.attrs.updateGeoCoordinates;
      focusInputs = vnode.attrs.focusInputs;

      updateBounds(value);
    },
    onbeforeupdate(vnode) {
      const {
        value,
      } = vnode.attrs;

      updateBounds(value);
    },
    view(vnode) {
      const {
        bundle,
        editable,
        inputsFocused,
        detectClick,
        detectLabel,
      } = vnode.attrs;

      state.inputsEditable = inputsFocused;
      const components = [m(`span.fas.fa-globe.fa-2x.${bid}__globe`)];
      if (detectClick && detectLabel) {
        components.push(m(Button, {
          text: detectLabel,
          onclick: detectClick,
          classNames: ['float-right', 'escoPosition__detect'],
        }));
      }

      let geoCoords;
      if (state.bounds.type === 'point') {
        geoCoords = ['latitude', 'longitude'];
      } else {
        geoCoords = ['north', 'south', 'east', 'west'];
      }

      geoCoords
        .forEach((dir) => {
          let dirTemp = dir.toLowerCase();

          // Add label
          components.push(
            m(
              `label.${bid}__label`,
              {
                title: bundle[`${dirTemp}Placeholder`],
                onclick: () => {
                  if (editable) {
                    inputFocus(dirTemp);
                  }
                },
              },
              bundle[`${dirTemp}LabelShort`],
            ),
          );

          // There is a difference in naming between the bound type and the label naming on points
          // so we need to account for that here after adding the label
          if (dirTemp === 'latitude') {
            dirTemp = 'lat';
          }
          if (dirTemp === 'longitude') {
            dirTemp = 'lng';
          }

          // Add value
          const directionValue = state.bounds !== undefined ? Number.parseFloat(state.bounds[dirTemp]) : '';

          let dirValueNode;

          if (editable) {
            dirValueNode = m(`input.${bid}__value`, {
              value: Number.isNaN(directionValue) ? '' : directionValue,
              onclick: () => inputFocus(dirTemp),
              onblur: m.withAttr('value', val => inputBlur(dirTemp, val)),
              autofocus: state.lastClickedDir === dirTemp,
            });
          } else {
            dirValueNode = m(`span.${bid}__value`, {
              title: directionValue,
              onclick: () => inputFocus(dirTemp),
            }, !Number.isNaN(directionValue) ? directionValue.toFixed(1) : '');
          }

          components.push(dirValueNode);
        });


      return m(`.${bid}`, components);
    },
  };
};
