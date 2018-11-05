import {Graph} from 'rdfjson';

const fixEoG = (eog, uri) => eog instanceof Graph ? {g: eog, r: uri} : {g: eog.getMetadata(), r: eog.getResourceURI()};

export {
  fixEoG,
}
