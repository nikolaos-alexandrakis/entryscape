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
    console.log(`Downloading for project in path: ${path}:`);
    const langs = ['en', 'sv'];
    const terms = [];
    if (apikey) {
      const poeAuth = poe(apikey, projectid);
      // eslint-disable-next-line no-restricted-syntax
      for (const lang of langs) {
        terms.push(await poeAuth.exportTermsAndDefinitions(lang));
        console.log(` Fetched ${lang} - ${terms[0].length} terms`);
      }
      // Don't forget to remove old dir first.
      nls.writeTranslations(langs, terms, path);
    }
  }
})();
