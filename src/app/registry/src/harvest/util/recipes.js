import config from 'config';

// TODO this is hacky. Read from config the recipe names at least
const fetch2recipe = {
  fetch: 'DCAT',
  fetchCKAN: 'CKAN',
  fetchCSW: 'INSPIRE',
};

export default {
  toArray(recipe, data) {
    const { source, name = '', profile = 'dcat_ap_se' } = data;
    let { psi } = data;
    let arrOfTransforms;

    switch (recipe) {
      case 'CKAN':
        arrOfTransforms = [
          ['empty', {}],
          ['fetchCKAN', { source }],
          ['ckan2rdf', { base: source }],
          ['validate', { profile }],
          ['merge', name ? { name } : {}],
        ];

        if (psi) {
          psi = psi.replace(/\/$/, ''); // remove trailing slash
          psi = `${psi}/${config.registry.psidataPath}`;
          arrOfTransforms.splice(1, 0, ['check', { source: psi }]);
        }

        return arrOfTransforms;
      case 'INSPIRE':
        return [
          ['empty', {}],
          ['fetchCSW', { source }],
          ['gml2rdf', { base: source }],
          ['validate', { profile }],
          ['merge', name ? { name } : {}],
        ];
      case 'DCAT':
        arrOfTransforms = [
          ['empty', {}],
          ['fetch', { source }],
          ['validate', { profile }],
          ['merge', name ? { name } : {}],
        ];

        if (psi) {
          psi = psi.replace(/\/$/, ''); // remove trailing slash
          psi = `${psi}/${config.registry.psidataPath}`;
          arrOfTransforms.splice(1, 0, ['check', { source: psi }]);
        }

        return arrOfTransforms;
      default:
        return [];
    }
  },
  detectRecipeAndValue(pipelineRes) {
    let recipe = null;
    let sourceUrl = null;
    pipelineRes.getTransforms().some((transformId) => {
      const transformKey = pipelineRes.getTransformType(transformId);

      if (transformKey in fetch2recipe) {
        sourceUrl = pipelineRes.getTransformArguments(transformId).source; // hack
        recipe = fetch2recipe[transformKey];
        return true;
      }
      return false;
    });
    return { recipe, sourceUrl };
  },
};
