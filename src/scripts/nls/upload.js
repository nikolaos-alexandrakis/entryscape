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

(async () => {
// eslint-disable-next-line no-restricted-syntax
  for (const projectid of Object.keys(projects)) {
    const path = projects[projectid];

    // Retrieve terms
    const terms = nls.readTerms(false, path, false);
    // Retrieve english definitions of terms
    const definitions = nls.readTerms(false, path, true);

    if (apikey) {
      const poeAuth = poe(apikey, projectid);

      // push terms to poeditor.
      await poeAuth.syncTerms(terms);
      // push definitions for english to poeditor
      await poeAuth.uploadDefinitions(definitions, 'en');
    }
  }
})();
