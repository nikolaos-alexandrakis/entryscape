import declare from 'dojo/_base/declare';
import ContentView from './ContentView';

export default declare([ContentView], {
  templateString: '<div ><div data-dojo-attach-point="__metadataViewer"></div></div>',
  includeMetadataPresentation: true,
});
