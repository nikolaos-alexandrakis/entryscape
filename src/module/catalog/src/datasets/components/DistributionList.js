import m from 'mithril';
import registry from 'commons/registry';
import Distribution from './Distribution';
import CreateDistribution from 'catalog/datasets/CreateDistribution';
import declare from 'dojo/_base/declare';
import DOMUtil from 'commons/util/htmlUtil';
import { i18n } from 'esi18n';
import { createSetState } from 'commons/util/util';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';

export default (vnode) => {
  const state = {
    distributions: [],
  };
  const setState = createSetState(state);

  const { dataset } = vnode.attrs;

  const escaDataset = i18n.getLocalization(escaDatasetNLS);

  const getDistributionStatements = entry => entry.getMetadata().find(entry.getResourceURI(), 'dcat:distribution');

  // Get the distributions from the entry and store them in the state
  const listDistributions = (datasetEntry) => {
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

        setState({fileEntryURIs}, true);

        return distributionEntry;
      }, () => null,
        // brokenReferences.style.display = '';
        // fail silently for missing distributions, list those that do exist.
        // return null;
      );
    }))
      .then(dists => setState({ distributions: dists }) );
  };

  const openCreateDialog = () => {
    const createDialog = new CreateDistribution({}, DOMUtil.create('div', null, vnode.dom));
    // TODO @scazan Some glue here to communicate with RDForms without a "row"
    createDialog.open({ row: { entry: dataset }, onDone: () => listDistributions(dataset) });
  };

  /*
   This deletes selected distribution and also deletes
   its relation to dataset
   */
  const removeDistribution = (distributionEntry) => {
    const resURI = distributionEntry.getResourceURI();
    const entryStoreUtil = registry.get('entrystoreutil');
    const fileStmts = distributionEntry.getMetadata().find(distributionEntry.getResourceURI(), 'dcat:downloadURL');
    const fileURIs = fileStmts.map(fileStmt => fileStmt.getValue());
    distributionEntry.del().then(() => {
      dataset.getMetadata().findAndRemove(null, registry.get('namespaces').expand('dcat:distribution'), {
        value: resURI,
        type: 'uri',
      });
      return dataset.commitMetadata().then(() => {
        distributionEntry.setRefreshNeeded();
        // self.datasetRow.clearDistributions();
        // self.datasetRow.listDistributions();
        return Promise.all(fileURIs.map(
          fileURI => entryStoreUtil.getEntryByResourceURI(fileURI)
            .then(fEntry => fEntry.del()))
        );
      });
    })
    .then(() => m.redraw());
      // .then(this.destroy.bind(this, false)); // TODO handle errors
  };

  /*
   * This deletes the selected API distribution. It also deletes relation to dataset,
   * corresponding API, pipelineResultEntry.
   */
  const deactivateAPInRemoveDist = (distributionEntry) => {
    const resURI = distributionEntry.getResourceURI();
    const es = distributionEntry.getEntryStore();
    const contextId = distributionEntry.getContext().getId();
    distributionEntry.del().then(() => {
      dataset.getMetadata().findAndRemove(null, registry.get('namespaces').expand('dcat:distribution'), {
        value: resURI,
        type: 'uri',
      });
      dataset.commitMetadata().then(() => {
        getEtlEntry(distributionEntry).then((etlEntry) => {
          const uri = `${es.getBaseURI() + contextId}/resource/${etlEntry.getId()}`;
          return es.getREST().del(`${uri}?proxy=true`)
            .then(() => etlEntry.del().then(() => {
              m.redraw();
              // this.datasetRow.clearDistributions();
              // this.datasetRow.listDistributions();
            }));
        });
      });
    });
  };

  const getEtlEntry = (entry) => {
    const md = entry.getMetadata();
    const esUtil = registry.get('entrystoreutil');
    const pipelineResultResURI = md.findFirstValue(entry.getResourceURI(), registry.get('namespaces').expand('dcat:accessURL'));
    return esUtil.getEntryByResourceURI(pipelineResultResURI)
      .then(pipelineResult => new Promise(r => r(pipelineResult)));
  };

  return {
    oninit: (vnode) => {
      const { dataset } = vnode.attrs;
    },
    view: () => {
      const distributions = state.distributions;
      listDistributions(dataset);

      return (
        <div class="distributions">
          <div class="header flex--sb">
            <h2 class="title">{escaDataset.distributionsTitle}</h2>
            <button class="btn--circle btn--action btn--add" onclick={openCreateDialog} alt={escaDataset.addDistributionTitle}>+</button>
          </div>
          { distributions.map(distribution => (
            <Distribution
              distribution={distribution}
              fileEntryURIs={state.fileEntryURIs}
              dataset={dataset}
              removeDistribution={removeDistribution}
              deactivateAPInRemoveDist={deactivateAPInRemoveDist}
            />
          )) }
        </div>
      );
    },
  };
};
