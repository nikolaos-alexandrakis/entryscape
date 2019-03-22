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


  const removeBrokenReferences = () => {
    const entry = dataset;
    const store = registry.get('entrystore');
    const cache = store.getCache();
    const md = entry.getMetadata();
    const datasetResourceURI = dataset.getResourceURI();
    const stmts = dataset.getMetadata().find(dataset.getResourceURI(), 'dcat:distribution');

    stmts.forEach((stmt) => {
      const ruri = stmt.getValue();
      const euri = store.getEntryURI(store.getContextId(ruri), store.getEntryId(ruri));
      if (cache.get(euri) == null) {
        md.findAndRemove(datasetResourceURI, 'dcat:distribution',
          { type: 'uri', value: ruri });
      }
    });

    dataset.commitMetadata();
  };

  const refreshDistributions = () => listDistributions(dataset);

  // Get the distributions from the entry and store them in the state
  const listDistributions = (datasetEntry) => {
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    const getDistributionStatements = entry => entry.getMetadata()
      .find(entry.getResourceURI(), 'dcat:distribution');
    const entryStoreUtil = registry.get('entrystoreutil');
    const fileEntryURIs = [];
    const uri2Format = [];

    const stmts = getDistributionStatements(datasetEntry) || [];

    return Promise.all(stmts.map((stmt) => {
      const resourceURI = stmt.getValue();
      return entryStoreUtil.getEntryByResourceURI(resourceURI, datasetEntry.getContext()).then((distributionEntry) => {
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
      });
    }))
      .then(dists => setState({ distributions: dists }))
      .catch(() => {
        registry.get('dialogs')
          .acknowledge(escaDataset.removeBrokenDatasetRefsWarning, escaDataset.removeBrokenDatasetRefs)
          .then(() => {
            removeBrokenReferences();
            listDistributions(datasetEntry);
          });
      });
  };

  const openCreateDialog = () => {
    actions.openCreateDialog(listDistributions);
  };

  return {
    oninit: () => {
      listDistributions(dataset);
    },
    view() {
      const escaDataset = i18n.getLocalization(escaDatasetNLS);
      const distributions = state.distributions;
      const distributionFormats = distributions.map(entry => entry.getMetadata()
        .findFirstValue(entry.getResourceURI(), 'dcterms:format'));

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

        <div class="list-wrapper">
            { distributions.map((distribution, i) => {
              const duplicateFileType = distributionFormats
                .filter((format, k) => i !== k && format === distributionFormats[i]).length > 0;

              return (
                <Distribution
                  distribution={distribution}
                  fileEntryURIs={state.fileEntryURIs}
                  dataset={dataset}
                  refreshDistributions={refreshDistributions}
                  hasDuplicateFileType={duplicateFileType}
                />
              );
            }) }
      </div>

        </div>
      );
    },
  };
};
