import registry from 'commons/registry';
import typeIndex from 'commons/create/typeIndex';

const sortF = (entityNames, isObj) => {
  const labelAndEntityNames = entityNames.map((entityName) => {
    const conf = isObj ? entityName : typeIndex.getConfByName(entityName);
    return {
      c: conf,
      n: entityName,
      l: registry.get('localize')(conf.label).toLowerCase(),
    };
  });
  // sort by label
  labelAndEntityNames.sort((a, b) => {
    if (a.l < b.l) {
      return -1;
    } else if (a.l > b.l) {
      return 1;
    }
    return 0; // if names are equal
  });
  if (isObj) {
    return labelAndEntityNames.map(o => o.c);
  }
  return labelAndEntityNames.map(o => o.n);
};
const _filterEntitytypes = (entityNames, isObj, isTemplate = false) => {
  const filteredEntitytypes = [];
  entityNames.forEach((entityName) => {
    const conf = isObj ? entityName : typeIndex.getConfByName(entityName);
    if (!conf || conf.dependant || (conf.module && conf.module !== 'workbench')) {
      return;
    }
    if (isObj) {
      if (isTemplate) {
        filteredEntitytypes.push(conf.template);
      } else {
        filteredEntitytypes.push(conf);
      }
    } else {
      filteredEntitytypes.push(entityName);
    }
  });
  return filteredEntitytypes;
};

const sortNames = names => sortF(names);
const sort = configurations => sortF(configurations, true);
const filterEntitypeConfigurations = configurations => _filterEntitytypes(configurations, true);
const filterEntitypeConfigurationsTemplates = configurations => _filterEntitytypes(configurations, true, true);
const filterEntitytypes = names => _filterEntitytypes(names);
const getEntitytypeConfigurationByName = entityName => typeIndex.getConfByName(entityName);
const getConfFromConstraints = constraintsParams => typeIndex.getConfFromConstraints(constraintsParams);

export default {
  sortNames,
  sort,
  filterEntitypeConfigurations,
  filterEntitypeConfigurationsTemplates,
  filterEntitytypes,
  getEntitytypeConfigurationByName,
  getConfFromConstraints,
};
