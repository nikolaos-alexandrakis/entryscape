const fs = require('fs');
const pathUtil = require('path');

const log = (str) => {
  console.log(str);
};

const loadJSON = path => JSON.parse(fs.readFileSync(path));
const writeJSON = (path, obj) => fs.writeFileSync(path, JSON.stringify(obj || {}, null, '  '));
const findFiles = (path) => {
  const arr = [];
  fs.readdirSync(path).forEach((p) => {
    const filename = pathUtil.join(path, p);
    if (!fs.lstatSync(filename).isDirectory()) {
      arr.push(filename);
    }
  });

  return arr;
};

const readTerms = (isRoot, path, includeDefs) => {
  const nlsFiles = findFiles(path);
  log(`Found ${nlsFiles.length} nls files`);
  const res = [];
  for (let i = 0; i < nlsFiles.length; i++) {
    let context = nlsFiles[i];
    const obj = loadJSON(context);
    // extract the filename without the path and .nls
    context = context.substr(path.length, context.length - path.length - 4);
    log(`context: ${context}`);
    const root = isRoot ? obj : obj.root;
    Object.keys(root).forEach((term) => {
      const definition = root[term];
//      log(`    ${term}: ${definition}`);
      if (includeDefs) {
        res.push({ term, context, definition });
      } else {
        res.push({ term, context });
      }
    });
  }
  return res;
};

const getContexts = (terms) => {
  const contexts = {};
  const arr = [];
  for (let t = 0; t < terms.length; t++) {
    const c = terms[t].context;
    if (!contexts[c]) {
      contexts[c] = true;
      arr.push(c);
    }
  }
  return arr;
};

const getContextGroupedTerms = (terms) => {
  const grouped = {};
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const context = term.context;
    if (context) {
      if (!grouped[context]) {
        grouped[context] = {};
      }
      grouped[context][term.term] = term.definition;
    }
  }
  return grouped;
};

const delNull = (terms) => {
  Object.keys(terms).forEach((k) => {
    if (terms[k] === null) {
      delete terms[k];
    }
  });
  return terms;
};


const createDirectory = (directory) => {
  try {
    if (!fs.statSync(directory).isDirectory()) {
      throw new Error('not a directory');
    }
  } catch(e) {
    fs.mkdirSync(directory);
  }
};

const writeLang = (path, lang, terms, contexts) => {
  const grouped = getContextGroupedTerms(terms);
  createDirectory(`${path + lang}/`);
  for (let i = 0; i < contexts.length; i++) {
    const c = contexts[i];
    writeJSON(`${path + lang}/${c}.nls`, delNull(grouped[c]));
  }
};

const writeTranslations = (_langs, terms, dest) => {
  const langs = _langs.slice(0);
  const enIdx = langs.indexOf('en');
  const enTerms = terms[enIdx];
  terms.splice(enIdx, 1);
  langs.splice(enIdx, 1);
  const contexts = getContexts(enTerms);
  for (let l = 0; l < langs.length; l++) {
    writeLang(dest, langs[l], terms[l], contexts);
  }
};

module.exports = {
  readTerms,
  writeTranslations,
};
