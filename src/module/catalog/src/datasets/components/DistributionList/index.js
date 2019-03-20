import registry from 'commons/registry';
import { i18n } from 'esi18n';
import { createSetState } from 'commons/util/util';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import Distribution from '../Distribution';
import bindActions from './actions';
import './index.scss';

/**
 * Displays a list of Distributions (PHASE II)
 *
 * @returns {object} A mithril component
 */
export default (initialVnode) => {
  const { dataset } = initialVnode.attrs;
  const actions = bindActions(dataset);

  const state = {
    distributions: [],
  };
  const setState = createSetState(state);

  const escaDataset = i18n.getLocalization(escaDatasetNLS);


  // Get the distributions from the entry and store them in the state
  const listDistributions = (datasetEntry) => {
    const getDistributionStatements = entry => entry.getMetadata()
      .find(entry.getResourceURI(), 'dcat:distribution');
    const entryStoreUtil = registry.get('entrystoreutil');
    const fileEntryURIs = [];
    const uri2Format = [];

    const stmts = getDistributionStatements(datasetEntry) || [];

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

        setState({ fileEntryURIs }, true);

        return distributionEntry;
      }, () => null,
      );
    }))
      .then(dists => setState({ distributions: dists }));
  };

  const openCreateDialog = () => {
    actions.openCreateDialog(listDistributions);
  };

  return {
    oninit: () => {
      listDistributions(dataset);
    },
    view() {
      const distributions = state.distributions;

      return (
        <div class="distributions">
          <div class="header flex--sb">
            <h2 class="title">{escaDataset.distributionsTitle}</h2>
            <button class="btn btn-primary btn--add btn-fab btn-raised"
              onclick={openCreateDialog}
              alt={escaDataset.addDistributionTitle}
            >
              +
            </button>
          </div>

          { distributions.map(distribution => (
            <Distribution
              distribution={distribution}
              fileEntryURIs={state.fileEntryURIs}
              dataset={dataset}
            />
          )) }

        </div>
      );
    },
  };
};
