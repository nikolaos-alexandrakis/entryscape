import { promiseUtil } from 'store';
import registry from '../../registry';

const logFixes = (fixes) => {
  let fixesCount = 0;
  Object.keys(fixes).forEach((id) => {
    const fixObj = fixes[id];
    fixObj.arr.forEach((fix) => {
      fixesCount += 1;
      console.log(`Problem "${fix.op}" found for: ${id}`);
      if (fix.value) {
        console.log(`Value: ${fix.value}`);
        if (fix.prop) {
          console.log(`Property: ${fix.prop}`);
        }
      }
    });
  });
  if (fixesCount === 0) {
    console.log('No problems detected with terminology');
  }
};

const fixConcepts = (scheme, eidx, fixes) => {
  const toSave = {};
  const smd = scheme.getMetadata();

  Object.keys(fixes).forEach((id) => {
    const fixObj = fixes[id];
    const md = eidx[id].getMetadata();

    fixObj.arr.forEach((fix) => {
      if (fix.op === 'missing') {
        if (fix.prop === 'skos:narrower' || fix.prop === 'skos:hasTopConcept') {
          md.add(id, fix.prop, fix.value);
          toSave[id] = true;
        } else if (fix.prop === 'skos:broader' || fix.prop === 'skos:topConceptOf') {
          if (fixObj.orphan) {
            md.add(id, fix.prop, fix.value);
            fixObj.orphan = false;
            toSave[id] = true;
          } else {
            const relC = eidx[fix.value];
            const invRel = fix.prop === 'skos:broader' ? 'skos:narrower' : 'skos:hasTopConcept';
            relC.getMetadata().findAndRemove(fix.value, invRel, id);
            toSave[fix.value] = true;
          }
        }
      } else if (fix.op === 'broken') {
        md.findAndRemove(id, fix.prop, fix.value);
        toSave[id] = true;
      }
    });
    if (fixObj.orphan) {
      md.add(id, 'skos:topConceptOf', scheme.getResourceURI());
      toSave[id] = true;
      smd.add(scheme.getResourceURI(), 'skos:hasTopConcept', id);
      toSave[scheme.getResourceURI()] = true;
    }
  });

  const conceptsToSave = [];
  Object.keys(toSave).forEach((ruri) => {
    console.log(`About to save: ${ruri}`);
    conceptsToSave.push(eidx[ruri]);
  });
  if (conceptsToSave.length > 0) {
    return promiseUtil.forEach(conceptsToSave, concept => concept.commitMetadata());
  }
  return Promise.all();
};

/**
 *
 * @returns {boolean} True if no s,p,o triple found
 */
const hasMissingInverse = (md, s, p, o) => !md.find(s, p, o).length;

const repair = {
  fix(context) {
    const es = registry.get('entrystore');
    let schemeProblem;
    let scheme;
    const concepts = [];
    const eidx = {};
    const fixes = {};
    const addFix = (c, fix) => {
      const id = c.getResourceURI();
      let obj = fixes[id];
      if (!obj) {
        obj = { arr: [] };
        fixes[id] = obj;
      }
      if (fix.op === 'orphan') {
        obj.orphan = true;
      }
      obj.arr.push(fix);
    };
    return es.newSolrQuery().rdfType('skos:ConceptScheme').context(context).list()
      .getEntries()
      .then((arrScheme) => {
        if (arrScheme.length !== 1) {
          schemeProblem = arrScheme;
          console.log('Scheme problem');
        }
        scheme = arrScheme[0];
        eidx[scheme.getResourceURI()] = scheme;
        return es.newSolrQuery().rdfType('skos:Concept').context(context).list()
          .forEach((c) => {
            concepts.push(c);
            eidx[c.getResourceURI()] = c;
          });
      })
      .then(() => {
        concepts.forEach((c) => {
          const md = c.getMetadata();
          let bstmts = md.find(c.getResourceURI(), 'skos:broader');
          let tstmts = md.find(c.getResourceURI(), 'skos:topConceptOf');
          const nstmts = md.find(c.getResourceURI(), 'skos:narrower');

          // broader
          bstmts = bstmts.filter((stmt) => {
            if (!eidx[stmt.getValue()]) {
              addFix(c, { op: 'broken', value: stmt.getValue(), prop: 'skos:broader' });
              return false;
            }
            return true;
          });
          if (bstmts.length > 1) {
            addFix(c, { op: 'multiplebroader' });
          } else if (bstmts.length === 1) {
            const stmt = bstmts[0];
            const relC = eidx[stmt.getValue()];
            if (hasMissingInverse(relC.getMetadata(), stmt.getValue(), 'skos:narrower', stmt.getSubject())) {
              addFix(relC, { op: 'missing', value: stmt.getSubject(), prop: 'skos:narrower' });
            }
          }

          // topConceptOf
          tstmts = tstmts.filter((stmt) => {
            if (stmt.getValue() !== scheme.getResourceURI()) {
              addFix(c, { op: 'unknownscheme', value: stmt.getValue() });
              return false;
            }
            return true;
          });

          if (tstmts.length > 0 && bstmts.length > 0) {
            addFix(c, { op: 'schemeandbroader' });
          } else if (tstmts.length === 1) {
            const stmt = tstmts[0];

            if (hasMissingInverse(scheme.getMetadata(), stmt.getValue(), 'skos:hasTopConcept', stmt.getSubject())) {
              addFix(scheme, {
                op: 'missing',
                value: stmt.getSubject(),
                prop: 'skos:hasTopConcept',
              });
            }
          } else if (tstmts.length === 0 && bstmts.length === 0) {
            addFix(c, { op: 'orphan' });
          }

          // narrower
          nstmts.forEach((stmt) => {
            const relC = eidx[stmt.getValue()];
            if (!relC) {
              addFix(c, { op: 'broken', value: stmt.getValue(), prop: 'skos:narrower' });
            } else if (hasMissingInverse(relC.getMetadata(), stmt.getValue(), 'skos:broader', stmt.getSubject())) {
              addFix(relC, { op: 'missing', value: stmt.getSubject(), prop: 'skos:broader' });
            }
          });
        });
      })
      .then(() => {
        // run a last check for all hasTopConcept
        const hstmts = scheme.getMetadata().find(scheme.getResourceURI(), 'skos:hasTopConcept');
        hstmts.forEach((stmt) => {
          const relC = eidx[stmt.getValue()];
          if (!relC) {
            addFix(undefined, { op: 'broken', value: stmt.getValue(), prop: 'skos:hasTopConcept' });
          } else if (hasMissingInverse(relC.getMetadata(), stmt.getValue(), 'skos:topConceptOf', stmt.getSubject())) {
            addFix(relC, { op: 'missing', value: stmt.getSubject(), prop: 'skos:topConceptOf' });
          }
        });

        // log and fix fixes
        logFixes(fixes);
        fixConcepts(scheme, eidx, fixes).then(() => {
          console.log('All good');
        }, () => {
          console.log('Not all good, contact admin');
        });
      }, () => {
        if (schemeProblem) {
          console.log(`There are ${schemeProblem.length} instances of skos:ConceptScheme in the context, only one is allowed.`);
          return;
        }
        console.log('exit');
      });
  },
};

export { repair };
export default repair;
