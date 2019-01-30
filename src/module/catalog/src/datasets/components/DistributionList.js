import m from 'mithril';
import registry from 'commons/registry';
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
      .then((dists) => { console.log('setting', dists); setState({ distributions: dists }); });
  };


  return {
    oninit: (vnode) => {
      const { entry } = vnode.attrs;
      listDistributions(entry);
    },
    view: () => {
      const distributions = state.distributions;
      console.log(distributions);

      return (
        <div class="distributions">
          <div class="header flex--sb">
            <h2 class="title">Distributions</h2>
            <button class="btn--circle btn--action btn--add">+</button>
          </div>
          { distributions.map(() => (
            <div tabindex="0" class="distribution__row flex--sb">
              <div class="distribution__format flex--sb">
                <p class="distribution__title"> Downloadable file</p>
                <p class="file__format">CSV <span class="file__format--long">Common Separated Values</span></p>
              </div>
              <div class="icon--wrapper">
                <p class="distribution__date">Jan 17</p>
                <button class="icons fa fa-external-link"></button>
                <button class="icons fa fa-download"></button>
                <button class="icons fa fa-cog"></button>
              </div>
            </div>
          )) }
        </div>
      );
    },
  };
};
