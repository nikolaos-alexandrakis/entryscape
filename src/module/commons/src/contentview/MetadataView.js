import ContentView from './ContentView';

import declare from 'dojo/_base/declare';

export default declare([ContentView], {
  templateString: '<div ><div data-dojo-attach-point="__metadataViewer"></div></div>',
  includeMetadataPresentation: true,
});
