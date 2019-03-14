import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import { i18n } from 'esi18n';
import DOMUtil from 'commons/util/htmlUtil';
import EditDialog from 'catalog/datasets/DatasetEditDialog';
import RevisionsDialog from 'catalog/datasets/RevisionsDialog';
import DowngradeDialog from 'catalog/candidates/DowngradeDialog';
import CommentDialog from 'commons/comments/CommentDialog';
import ShowIdeasDialog from 'catalog/datasets/ShowIdeasDialog';
import ShowShowcasesDialog from 'catalog/datasets/ShowResultsDialog';
import {
  getParentCatalogEntry,
} from 'commons/util/metadata';
import {
  isUploadedDistribution,
  isAPIDistribution,
  getDistributionTemplate,
} from 'catalog/datasets/utils/distributionUtil';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import escoCommentNLS from 'commons/nls/escoComment.nls';

const getDistributionStatements = entry => entry.getMetadata().find(entry.getResourceURI(), 'dcat:distribution');

const updateDistributionACL = (acl, entry) => {
  const stmts = getDistributionStatements(entry);
  stmts.forEach((stmt) => {
    const esu = registry.get('entrystoreutil');
    const resourceURI = stmt.getValue();

    esu.getEntryByResourceURI(resourceURI).then((resourceEntry) => {
      if (acl) {
        const resourceEntryInfo = resourceEntry.getEntryInfo();
        resourceEntryInfo.setACL(acl);
        resourceEntryInfo.commit();
      }
    });
  });
};

export default (entry, dom) => {
  const openDialog = (DialogClass) => {
    const dialog = new DialogClass({}, DOMUtil.create('div', null, dom));
    // @scazan Some glue here to communicate with RDForms without a "row"
    dialog.open({
      nlsPublicTitle: 'publicDatasetTitle',
      nlsProtectedTitle: 'privateDatasetTitle',
      row: { entry },
      onDone: () => m.redraw(),
    });
  };

  const openEditDialog = () => {
    const editDialog = new EditDialog({ entry }, DOMUtil.create('div', null, dom));
    editDialog.showEntry(entry, () => {
      entry.refresh().then(() => m.redraw());
    });
  };

  const unpublishDataset = (groupEntry, onSuccess) => {
    const ei = entry.getEntryInfo();
    const acl = ei.getACL(true);
    acl.admin = acl.admin || [];
    acl.admin.push(groupEntry.getId());
    ei.setACL(acl);
    // this.reRender();
    ei.commit().then(onSuccess);
    updateDistributionACL(acl, entry);
  };

  const setPublished = (publishedState) => {
    const onSuccess = () => m.redraw();
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    const toggleThisImplementation = () => {
      const ns = registry.get('namespaces');
      const ei = entry.getEntryInfo();
      const dialogs = registry.get('dialogs');
      registry.get('getGroupWithHomeContext')(entry.getContext()).then((groupEntry) => {
        if (groupEntry.canAdministerEntry()) {
          if (publishedState) {
            const apiDistributionURIs = [];
            const esu = registry.get('entrystoreutil');
            const stmts = getDistributionStatements(entry);
            Promise.all(stmts.map((stmt) => {
              const ruri = stmt.getValue();
              return esu.getEntryByResourceURI(ruri).then((distEntry) => {
                const source = distEntry.getMetadata()
                  .findFirstValue(distEntry.getResourceURI(), ns.expand('dcterms:source'));
                if (source !== '' && source != null) {
                  apiDistributionURIs.push(source);
                }
              }, () => undefined); // fail silently
            }));

            if (apiDistributionURIs.length === 0) {
              return unpublishDataset(groupEntry, onSuccess);
            }

            const confirmMessage = escaDataset.apiExistsToUnpublishDataset;
            return dialogs.confirm(confirmMessage, null, null, (confirm) => {
              if (confirm) {
                return unpublishDataset(groupEntry, onSuccess);
              }
              return null;
            });
          }

          // Make this dataset public by emptying the ACL and relying on parent
          ei.setACL({});
          ei.commit().then(onSuccess);
          updateDistributionACL({}, entry);
        } else {
          registry.get('dialogs').acknowledge(escaDataset.datasetSharingNoAccess);
        }

        return undefined;
      });
    };

    if (publishedState) {
      const es = registry.get('entrystore');
      const adminRights = registry.get('hasAdminRights');
      const userEntry = registry.get('userEntry');
      const ccg = config.catalog.unpublishDatasetAllowedFor;
      const allowed = ccg === '_users' ? true :
        userEntry.getParentGroups().indexOf(es.getEntryURI('_principals', ccg)) >= 0;
      if (!adminRights && !allowed) {
        registry.get('dialogs').acknowledge(escaDataset.unpublishProhibited);
        return;
      }
    } else if (entry.getMetadata().find(null, 'dcat:distribution').length === 0) {
      registry.get('dialogs').confirm(
        escaDataset.confirmPublishWithoutDistributions,
        escaDataset.proceedPublishWithoutDistributions,
        escaDataset.cancelPublishWithoutDistributions,
      ).then(toggleThisImplementation);

      return;
    }

    toggleThisImplementation();
  };

  const removeDataset = () => {
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    const dialogs = registry.get('dialogs');
    const store = registry.get('entrystore');
    const ns = registry.get('namespaces');
    const cache = store.getCache();
    const stmts = getDistributionStatements(entry);

    // check for filedistribution/api distrubtions
    const esu = registry.get('entrystoreutil');
    const fileDistributionURIs = [];
    const apiDistributionURIs = [];
    const baseURI = store.getBaseURI();

    const es = registry.get('entrystore');
    Promise.all(stmts.map((stmt) => {
      const ruri = stmt.getValue();
      return esu.getEntryByResourceURI(ruri).then((entry) => {
        const source = entry.getMetadata().findFirstValue(entry.getResourceURI(), ns.expand('dcterms:source'));
        const downloadURI = entry.getMetadata().findFirstValue(entry.getResourceURI(), ns.expand('dcat:downloadURL'));

        if (source !== '' && source != null) {
          apiDistributionURIs.push(source);
        }
        if (downloadURI !== '' && downloadURI != null && downloadURI.indexOf(baseURI) > -1) {
          fileDistributionURIs.push(downloadURI);
        }
      }, () => {
      }); // fail silently
    }))
      .then(() => {
        if (apiDistributionURIs.length > 0 && fileDistributionURIs.length > 0) {
          dialogs.acknowledge(escaDataset.removeDatasetWithFileAndApiDistributions);
          return;
        } else if (apiDistributionURIs.length > 0) {
          dialogs.acknowledge(escaDataset.removeFileDistAPI);
          return;
        } else if (fileDistributionURIs.length > 0) {
          dialogs.acknowledge(escaDataset.removeDatasetWithFileDistributions);
          return;
        }
        if (apiDistributionURIs.length === 0 && fileDistributionURIs.length === 0) {
          let confirmMessage;
          if (stmts.length > 0) {
            if (self.noOfComments > 0) { // TODO @scazan
              confirmMessage = i18n.renderNLSTemplate(
                escaDataset.removeDatasetDistributionsAndCommentsConfirm,
                { distributions: stmts.length, comments: self.noOfComments },
              );
            } else {
              confirmMessage = i18n.renderNLSTemplate(
                escaDataset.removeDatasetAndDistributionsQuestion,
                stmts.length,
              );
            }
          } else if (self.noOfComments > 0) { // TODO @scazan
            confirmMessage = i18n.renderNLSTemplate(
              escaDataset.removeDatasetAndCommentsConfirm,
              self.noOfComments,
            );
          } else {
            confirmMessage = escaDataset.removeDatasetQuestion;
          }
          dialogs.confirm(confirmMessage, null, null, (confirm) => {
            if (!confirm) {
              return;
            }
            const dists = stmts.map((stmt) => {
              const ruri = stmt.getValue();
              return cache.getByResourceURI(ruri);
            })
              .filter(dist => dist.length > 0);

            es.newSolrQuery()
              .uriProperty('oa:hasTarget', entry.getResourceURI()).rdfType('oa:Annotation')
              .list()
              .getEntries(0)
              .then((allComments) => {
                Promise.all(allComments.map(comment => comment.del())).then(() => {
                  Promise.all(dists.map(dist => dist[0].del())).then(() => {
                    const resURI = entry.getResourceURI();
                    return entry.del()
                      .then(() => registry.get('entrystoreutil').getEntryByType('dcat:Catalog', entry.getContext())
                        .then((catalog) => {
                          catalog.getMetadata().findAndRemove(null, ns.expand('dcat:dataset'), {
                            value: resURI,
                            type: 'uri',
                          });
                          return catalog.commitMetadata();
                        }))
                        // Redirect to upper catalog after deletion
                      .then(navigateToCatalog);
                  }, () => {
                    dialogs.acknowledge(escaDataset.failedToRemoveDatasetDistributions);
                  });
                });
              });
          });
        }
      });
  };

  const openRevisions = () => {
    const revisionsDialog = new RevisionsDialog({}, DOMUtil.create('div', null, dom));

    if (isUploadedDistribution(entry, registry.get('entrystore'))) {
      revisionsDialog.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL'];
    } else if (isAPIDistribution(entry)) {
      revisionsDialog.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL', 'dcterms:source'];
    } else {
      revisionsDialog.excludeProperties = [];
    }
    revisionsDialog.excludeProperties = revisionsDialog
      .excludeProperties.map(property => registry.get('namespaces').expand(property));

    // @scazan Some glue here to communicate with RDForms without a "row"
    revisionsDialog.open({
      row: { entry },
      onDone: () => m.redraw(),
      template: getDistributionTemplate(config.catalog.distributionTemplateId),
    });
  };

  const openComments = (onUpdate) => {
    const commentsDialog = new CommentDialog({
      nlsBundles: [{ escoCommentNLS, escaDatasetNLS }],
    }, DOMUtil.create('div', null, dom));
    // @scazan Some glue here to communicate with RDForms without a "row"
    commentsDialog.open({
      nlsPublicTitle: 'publicDatasetTitle',
      nlsProtectedTitle: 'privateDatasetTitle',
      row: {
        entry,
        renderCommentCount: () => onUpdate(commentsDialog.row.noOfComments),
      },
    });

    onUpdate().then((numComments) => {
      commentsDialog.row.noOfComments = numComments;
    });
  };

  const openIdeas = () => {
    openDialog(ShowIdeasDialog);
  };

  const openShowcases = () => {
    openDialog(ShowShowcasesDialog);
  };

  const openDowngrade = () => {
    openDialog(DowngradeDialog);
  };

  const openPreview = () => {
    /**
     * Encoded resource URI; base64 used
     * @type {string}
     */
    const dataset = entry.getId();
    if (config.catalog && config.catalog.previewURLNewWindow) {
      window.open(url, '_blank'); // @scazan TODO url is undefined but was, seemingly, also undefined in the original
    } else {
      const site = registry.get('siteManager');
      const state = site.getState();
      const { context } = state[state.view];
      site.render('catalog__datasets__preview', { context, dataset });
    }
  };

  const navigateToCatalog = () => {
    const site = registry.get('siteManager');
    const state = site.getState();
    const { context } = state[state.view];
    site.render('catalog__datasets', { context });
  };

  return {
    openEditDialog,
    removeDataset,
    setPublished,
    navigateToCatalog,
    openRevisions,
    openComments,
    openIdeas,
    openShowcases,
    openPreview,
    openDowngrade,
  };
};
