import m from 'mithril';
import config from 'config';
import utils from '../utils';
import '../escoSpatial.css';
let leaflet;

const Map = (vnode) => {

  const state = {
    drawingMode: 'disabled', // disabled, marker, or region
    map: undefined,
    latLngVector: [],
  };

  const assetsPath = config.theme.assetsPath;

  let updateGeoCoordinates;
  let unfocusInputs;

  const getPolygonFromLatLngs = points => {
    return leaflet.polygon(points);
  };
  const getMarkerFromLatLng = point => {
    return leaflet.marker(point);
  };

  const convertTwoPointsToQuadrilateral = latLngVector => {
    if (latLngVector.length < 2) {
      return latLngVector;
    }
    else {
      return [latLngVector[0], {
        lat: latLngVector[0].lat,
        lng: latLngVector[1].lng
      }, latLngVector[1], {lat: latLngVector[1].lat, lng: latLngVector[0].lng}];
    }
  };

  const getConstructedMap = mapNode => {
    let map
    try {
      map = leaflet.map(mapNode).setView([0, 0], 1);
    } catch (e) {
      // Just in case mithril are reusing dom nodes and leaflet is already initalized here (this is a guess)
    }

    const mapTileURL = config.itemstore && config.itemstore.geochooserMapURL != null
      ? config.itemstore.geochooserMapURL : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const mapTileAttribution = config.itemstore && config.itemstore.geochooserMapAttribution != null
      ? config.itemstore.geochooserMapAttribution
      : 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';

    leaflet.tileLayer(mapTileURL, {
      attribution: mapTileAttribution,
      maxZoom: 18,
    }).addTo(map);

    return map;
  };

  const clearMapLayers = map => {
    // Slice off the first layer as it is the map itself
    Object.entries(map._layers)
      .sort((keyValA, keyValB) => keyValA[0] - keyValB[0]) // Sort smallest number to top
      .slice(1)
      .map(layer => map.removeLayer(layer[1])); // slice off top (map), remove the rest

    return map;
  };

  const populateMapWithValue = (map, value) => {
    const wkt = utils.fromWKT(value);

    if (wkt !== undefined) {
      if (wkt.type === 'polygon') {
        const geojson = utils.toGeoJSON(wkt);
        const geoLocationPolygon = getPolygonFromLatLngs(geojson.coordinates[0].map(coordPair => [parseFloat(coordPair[1]), parseFloat(coordPair[0])]));
        geoLocationPolygon.addTo(map);
        map.fitBounds(geoLocationPolygon.getBounds());
      }
      else if (wkt.type === 'point') {
        addMarkerToMap(map, wkt);
      }
    }
  };

  const addRegionToMap = (map, latLngVector) => {
    const geoLocationPolygon = getPolygonFromLatLngs(convertTwoPointsToQuadrilateral(latLngVector));

    geoLocationPolygon.addTo(map);
    unfocusInputs();
  };

  const addMarkerToMap = (map, latLng) => {
    const markerIcon = leaflet.icon({
      iconUrl: assetsPath + "components/spatial/markerGreen.svg",
      iconAnchor: [12, 25],
    });

    const geoLocationMarker = leaflet.marker(latLng, {
      icon: markerIcon,
    });

    geoLocationMarker.addTo(map);

    const latLngBounds = leaflet.latLngBounds([geoLocationMarker.getLatLng()]);
    map.fitBounds(latLngBounds);
    map.zoomOut(3); // Zooming out by one level for usability
    unfocusInputs();
  };

  const Map = {
    view() {
      return m('.escoMap', {});
    },
    oncreate(vnode) {
      // Attributes interface
      const {
        value,
        editable,
      } = vnode.attrs;

      updateGeoCoordinates = vnode.attrs.updateGeoCoordinates;
      unfocusInputs = vnode.attrs.unfocusInputs;

     import(/* webpackChunkName: "leaflet" */ 'leaflet').then( leafletImport => {
       leaflet = leafletImport.default;
        const map = getConstructedMap(vnode.dom);
        state.map = map;

        populateMapWithValue(map, value);

        if (editable) {
          this.bindMapEvents(map);
          this.addEditControls(map);
        }

        m.redraw();
      });
    },
    onbeforeupdate(vnode, oldVnode) {
      const oldValue = oldVnode.attrs.value;
      const newValue = vnode.attrs.value;
      if (oldValue === newValue) {
        return false;
      }
    },
    onupdate(vnode) {
      const {value} = vnode.attrs;

      if(state.map) {
        clearMapLayers(state.map);
        populateMapWithValue(state.map, value);
      }
    },

    bindMapEvents(map) {
      map.on('click', e => this.onMapClick(e, map));
    },
    addEditControls(map) {
      const DrawingModeControl = leaflet.Control.extend({
        onAdd: map => {
          const controlContainer = document.createElement('div');

          const regionToggle = document.createElement('span');
          regionToggle.classList.add('region');

          regionToggle.onclick = e => {
            e.stopPropagation();
            state.drawingMode = state.drawingMode === 'region' ? 'disabled' : 'region';
            state.latLngVector.length = 0;

            updateUI(state.drawingMode);
          };

          const markerToggle = document.createElement('span');
          markerToggle.classList.add('marker');

          markerToggle.onclick = e => {
            e.stopPropagation();
            state.drawingMode = state.drawingMode === 'marker' ? 'disabled' : 'marker';
            state.latLngVector.length = 0;

            updateUI(state.drawingMode);
          }

          const updateUI = drawingMode => {
            if (drawingMode === 'region') {
              regionToggle.classList.add('active')
              regionToggle.style.backgroundImage = "url('" + assetsPath + "components/spatial/regionGreen.svg')";
            }
            else {
              regionToggle.classList.remove('active');
              regionToggle.style.backgroundImage = "url('" + assetsPath + "components/spatial/regionBlue.svg')";
            }

            if (drawingMode === 'marker') {
              markerToggle.classList.add('active')
              markerToggle.style.backgroundImage = "url('" + assetsPath + "components/spatial/markerGreen.svg')";
            }
            else {
              markerToggle.classList.remove('active');
              markerToggle.style.backgroundImage = "url('" + assetsPath + "components/spatial/markerBlue.svg')";
            }
          };

          controlContainer.appendChild(markerToggle);
          controlContainer.appendChild(regionToggle);

          updateUI(state.drawingMode);
          return controlContainer;
        },
        onRemove: map => {
        },
      });

      const drawingModeControl = new DrawingModeControl('topright');

      drawingModeControl.addTo(map);
    },

    onMapClick(event, map) {
      const {latlng} = event;

      switch (state.drawingMode) {
        case 'region':
          this.regionModeClick(map, latlng);
          break;
        case 'marker':
          this.markerModeClick(map, latlng);
          break;
        default:
      }
    },
    regionModeClick(map, latLng) {
      clearMapLayers(map);

      if (state.latLngVector.length < 2) {
        state.latLngVector.push(latLng);
      }
      else {
        state.latLngVector = [latLng];
      }

      addRegionToMap(map, state.latLngVector);

      if (state.latLngVector.length === 2) {
        const regionBounds = utils.convertTwoPointsToBounds(state.latLngVector);
        updateGeoCoordinates(utils.toWKT(regionBounds));
      }
    },
    markerModeClick(map, latLng) {
      clearMapLayers(map);
      state.latLngVector = [latLng];

      addMarkerToMap(map, latLng);
      updateGeoCoordinates(utils.toWKT(utils.convertPointToGeoCoords(latLng)));
    },
  };

  return Map;
};

export {Map};
export default Map;
