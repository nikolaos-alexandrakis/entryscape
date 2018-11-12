const utils = {
  toGeoJSON(p) {
    return {
      type: 'Polygon',
      crs: {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
        },
      },
      coordinates: [[
        [p.west, p.north],
        [p.east, p.north],
        [p.east, p.south],
        [p.west, p.south],
        [p.west, p.north],
      ]],
    };
  },

  toWKT(p) {
    /* Well-Known Text (WKT) encoding */
    if (p.marker) {
      return `POINT(${p.lng} ${p.lat})`;
    }
    else {
      return `POLYGON((${p.west} ${p.north},${p.east} ${p.north},${p.east} ${p.south},${p.west} ${p.south},${p.west} ${p.north}))`;
    }
  },

  fromWKT(val) {
    const p = {};

    const polygonTest = val.match(/POLYGON\(\((.*)\)\)/);
    const pointTest = val.match(/POINT\((.*)\)/);

    const geoType = (polygonTest !== null && polygonTest.length > 1) ? 'polygon'
      : (pointTest !== null && pointTest.length > 1) ? 'point'
        : undefined;

    switch (geoType) {
      case 'polygon':

        let arr = polygonTest;

        arr = arr[1].split(',');
        if (arr.length === 5) {
          let arr2 = arr[0].split(' ');
          p.west = arr2[0];
          p.north = arr2[1];
          arr2 = arr[2].split(' ');
          p.east = arr2[0];
          p.south = arr2[1];

          p.type = geoType;
          return p;
        }
        else {
          return undefined;
        }

        break;
      case 'point':
        const lngLat = pointTest[1]
          .split(' ');

        return {
          type: geoType,
          lat: parseFloat(lngLat[1]),
          lng: parseFloat(lngLat[0]),
        };

        break;
      default:
        return undefined;

    }
    ;

  },

  convertPointToGeoCoords(point) {
    return Object.assign({
      marker: true,
    }, point);
  },
  convertTwoPointsToBounds([coordinateA, coordinateB]) {
    const [west, east] = coordinateA.lng < coordinateB.lng ? [coordinateA.lng, coordinateB.lng] : [coordinateB.lng, coordinateA.lng];
    const [north, south] = coordinateA.lat > coordinateB.lat ? [coordinateA.lat, coordinateB.lat] : [coordinateB.lat, coordinateA.lat];

    return {
      north,
      south,
      east,
      west,
    };
  },

};

export default utils;
