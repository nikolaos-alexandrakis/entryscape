import m from 'mithril';
import registry from 'commons/registry';
import Distribution from './Distribution';
import { createSetState } from 'commons/util/util';

export default () => {
  const state = {
    distributions: [],
  };
  const setState = createSetState(state);

  const getDistributionStatements = entry => entry.getMetadata().find(entry.getResourceURI(), 'dcat:distribution');

  const listDistributions = (entry) => {
    const entryStoreUtil = registry.get('entrystoreutil');
    const fileEntryURIs = [];
    const uri2Format = [];

    const stmts = getDistributionStatements(entry) || [];

    return Promise.all(stmts.map((stmt) => {
      const resourceURI = stmt.getValue();
      return entryStoreUtil.getEntryByResourceURI(resourceURI).then((distributionEntry) => {
        const source = distributionEntry
          .getMetadata()
          .findFirstValue(distributionEntry.getResourceURI(), 'dcterms:source');
        if (source !== '' && source != null) {
          fileEntryURIs.push(source);
        }
        const format = distributionEntry
          .getMetadata()
          .findFirstValue(distributionEntry.getResourceURI(), 'dcterms:format');
        if (format !== '' && format != null) {
          uri2Format[distributionEntry.getResourceURI()] = format;
        }
        return distributionEntry;
      }, () => null,
        // brokenReferences.style.display = '';
        // fail silently for missing distributions, list those that do exist.
        // return null;
      );
    }))
      .then(dists => setState({ distributions: dists }) );
  };


  return {
    oninit: (vnode) => {
      const { entry } = vnode.attrs;
      listDistributions(entry);
    },
    view: () => {
      const distributions = state.distributions;

      return (
        <div class="distributions">
          <div class="header flex--sb">
            <h2 class="title">Distributions</h2>
            <button class="btn--circle btn--action btn--add">+</button>
          </div>
          { distributions.map(distribution => (
            <Distribution distribution={distribution}></Distribution>
          )) }
        </div>
      );
    },
  };
};
