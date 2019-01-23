/* eslint-disable no-await-in-loop */
const nls = require('./nls');
const poe = require('./poeclient');
const projects = require('./projects');

let apikey;
try {
  apikey = require('./apikey');
} catch (e) {
  console.log('You have to provide an API-key from POEditor and put it in the apikey.js file,' +
    ' see how it is done in apikey.js_example');
}

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
// eslint-disable-next-line no-restricted-syntax
  for (const projectid of Object.keys(projects.id2path)) {
    const path = projects.id2path[projectid];

    // Retrieve terms
    const terms = nls.readTerms(false, path, false);
    // Retrieve english definitions of terms
    const definitions = nls.readTerms(false, path, true);

    if (apikey) {
      const poeAuth = poe(apikey, projectid);

      // push terms to poeditor.
      console.log(`Uploading terms from ${path}`);
      await poeAuth.syncTerms(terms);
      console.log(`Uploading english translations from ${path}`);
      await poeAuth.uploadDefinitions(definitions, 'en');
      console.log('Waiting 10 seconds due to API restrictions');
      await delay(10250);
    }
  }
})();
