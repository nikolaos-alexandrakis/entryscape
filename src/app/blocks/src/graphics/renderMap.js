import handlebars from 'blocks/boot/handlebars';
import getEntry from 'blocks/utils/getEntry';
import registry from 'commons/registry';
import jquery from 'jquery';

let depLoad;
let leaflet;
const loadDependencies = async () => {
  if (!depLoad) {
    leaflet = await import(/* webpackChunkName: "leaflet" */ 'leaflet');
    import(/* webpackChunkName: "leaflet-css" */ 'leaflet/dist/leaflet.css');

    leaflet.Icon.Default.imagePath = 'https://static.entryscape.com/libs/leaflet/dist/images/';
  }

  return depLoad;
};

export default (node, data) => {
  loadDependencies().then(() => {
    getEntry(data, (entry) => {
      setTimeout(() => {
        node.style.height = data.height ? data.height : '300px';
        node.style.display = 'block';
        const layers = data.layers || [];
        if (layers.length === 0) {
          if (data.tilelayer) {
            layers.push({
              tilelayer: data.tilelayer,
              maxzoom: data.maxzoom,
              attribution: data.attribution,
            });
          } else {
            layers.push({
              tilelayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              maxzoom: '18',
              attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a' +
                  ' href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            });
          }
        }

        const createTileLayer = layer => leaflet.tileLayer(layer.tilelayer, {
          attribution: layer.attribution,
          maxZoom: layer.maxzoom,
        });

        let map;
        if (layers.length === 1) {
          // Single layer
          map = leaflet.map(node).setView([0, 0], 1);
          const layer = layers[0];
          createTileLayer(layer).addTo(map);
        } else {
          // Multiple layers
          const baseLayers = {};
          const layerArr = [];
          layers.reverse().forEach((layer) => {
            const tl = createTileLayer(layer);
            layerArr.push(tl);
            baseLayers[layer.tilename] = tl;
          });
          map = leaflet.map(node, { layers: layerArr }).setView([0, 0], 1);
          leaflet.control.layers(baseLayers).addTo(map);
        }

        const md = entry.getMetadata();
        const lat = md.findFirstValue(entry.getResourceURI(), 'http://www.w3.org/2003/01/geo/wgs84_pos#lat');
        const long = md.findFirstValue(entry.getResourceURI(), 'http://www.w3.org/2003/01/geo/wgs84_pos#long');

        const setView = (geoLat, geoLong, zoom) => {
          const latlong = [parseFloat(geoLat.replace(',', '.')), parseFloat(geoLong.replace(',', '.'))];
          const lmarker = leaflet.marker(latlong).addTo(map);
          if (data.popup) {
            const popupNode = document.createElement('span');
            handlebars.run(popupNode, data, data.popup, entry);
            const pop = lmarker.bindPopup(popupNode);
            if (data.popupOnload) {
              pop.openPopup();
            }
          }

          map.setView(latlong, zoom ? parseInt(data.zoom, 10) : 8);
          leaflet.control.scale({ position: 'bottomleft', imperial: false }).addTo(map); // scale bar
        };
        if (lat !== undefined) {
          setView(lat, long, data.zoom ? parseInt(data.zoom, 10) : 8);
        } else {
          const addressResourceURI = md.findFirstValue(entry.getResourceURI(), 'schema:address', null);
          if (!addressResourceURI) {
            return;
          }
          registry.get('entrystoreutil').getEntryByResourceURI(addressResourceURI).then((addressEntry) => {
            const addrMD = addressEntry.getMetadata();
            let streetAddress = addrMD.findFirstValue(addressEntry.getResourceURI(), 'schema:streetAddress') || '';
            streetAddress = streetAddress.split(',')[0].trim();
            const addressLocality = addrMD.findFirstValue(
              addressEntry.getResourceURI(),
              'schema:addressLocality',
            ) || '';
            const addressRegion = addrMD.findFirstValue(addressEntry.getResourceURI(), 'schema:addressRegion') || '';
            const baseQuery = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&json_callback=?';
            // Requests to be made, from last to first.
            const reqs = [
              `${baseQuery}&street=${streetAddress}`,
              `${baseQuery}&street=${streetAddress}&city=${addressLocality}`,
              `${baseQuery}&street=${streetAddress}&county=${addressRegion}`,
              `${baseQuery}&q=${streetAddress}, ${addressLocality}, ${addressRegion}`,
            ];
            const findAddress = () => {
              jquery.getJSON(reqs.pop(), (response) => {
                if (response && response.length > 0) {
                  setView(response[0].lat, response[0].lon, response.zoom);
                } else if (reqs.length > 0) {
                  findAddress();
                }
              });
            };
            findAddress();
          });
        }
      }, data.delay ? parseInt(data.delay, 10) : 1);
    });
  });
};
