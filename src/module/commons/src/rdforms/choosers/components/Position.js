import m from 'mithril';
import utils from '../utils';

const bid = 'escoPosition';

const Position = vnode => {
  let updateGeoCoordinates;
  let focusInputs;
  const state = {
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

  const inputFocus = dir => {
    state.lastClickedDir = dir;
    focusInputs();
  };

  const inputBlur = (dir, val) => {
    updateGeoCoordinatesState(dir, val);
  };

  const updateGeoCoordinatesState = (direction, value) => {
    state.bounds[direction] = parseFloat(value);

    if (Number.isNaN(parseFloat(value))) {
      return false;
    }

    let shouldUpdate = true;
    // Clean state bounds
    Object.entries(state.bounds).forEach(keyVal => {
      if (keyVal[1] == null || Number.isNaN(keyVal[1])) {
        state.bounds[keyVal[0]] = 0;
      }
    });


    if (state.bounds.type === 'point') {
      const latLng = {lat: state.bounds.lat, lng: state.bounds.lng};
      updateGeoCoordinates(utils.toWKT(utils.convertPointToGeoCoords(latLng)));
    }
    else {
      updateGeoCoordinates(utils.toWKT(state.bounds));
    }
  };

  const updateBounds = value => {
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
        value,
        bundle,
        editable,
        inputsFocused,
        detectClick,
        detectLabel,
      } = vnode.attrs;

      state.inputsEditable = inputsFocused;
      const components = [m(`span.fa.fa-globe.fa-2x.${bid}__globe`)];
      if (detectClick && detectLabel) {
        components.push(m(Button, {
          text: detectLabel, onclick: detectClick,
          classNames: ['pull-right', 'escoPosition__detect']
        }));
      }

      let geoCoords;
      if (state.bounds.type === 'point') {
        geoCoords = ['latitude', 'longitude'];
      }
      else {
        geoCoords = ['north', 'south', 'east', 'west'];
      }

      geoCoords
        .map(dir => {
          dir = dir.toLowerCase();

          // Add label
          components.push(
            m(
              `label.${bid}__label`,
              {
                title: bundle[`${dir}Placeholder`],
                onclick: (e) => {
                  editable && inputFocus(dir)
                },
              },
              bundle[`${dir}LabelShort`]
            )
          );

          // There is a difference in naming between the bound type and the label naming on points
          // so we need to account for that here after adding the label
          if (dir === 'latitude') {
            dir = 'lat';
          }
          if (dir === 'longitude') {
            dir = 'lng';
          }

          // Add value
          const directionValue = state.bounds !== undefined ? Number.parseFloat(state.bounds[dir]) : "";

          let dirValueNode;

          if (editable) {
            const focus = state.lastClickedDir === dir;

            dirValueNode = m(`input.${bid}__value`, {
              value: Number.isNaN(directionValue) ? '' : directionValue,
              onclick: (e) => {
                inputFocus(dir)
              },
              onblur: m.withAttr('value', val => inputBlur(dir, val)),
              autofocus: state.lastClickedDir === dir,
            });
          }
          else {
            dirValueNode = m(`span.${bid}__value`, {
              title: directionValue, onclick: (e) => {
                inputFocus(dir)
              }
            }, !Number.isNaN(directionValue) ? directionValue.toFixed(1) : "");
          }

          components.push(dirValueNode);
        });


      return m(`.${bid}`, components);
    },
  };

};

export default Position;
