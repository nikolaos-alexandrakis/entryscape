/* eslint-disable import/prefer-default-export */
import registry from 'commons/registry';
import { Graph } from 'rdfjson';

const fixEoG = (eog, uri) => (eog instanceof Graph ?
  { g: eog, r: uri } : { g: eog.getMetadata(), r: eog.getResourceURI() });

const getEntryRenderName = entry => registry.get('rdfutils').getLabel(entry);


export {
  fixEoG,
  getEntryRenderName,
};
