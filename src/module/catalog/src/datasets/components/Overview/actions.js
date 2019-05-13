import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import declare from 'dojo/_base/declare';
import { i18n } from 'esi18n';
import Lookup from 'commons/types/Lookup';
import { createEntry } from 'commons/util/storeUtil';
import DowngradeDialog from 'catalog/candidates/DowngradeDialog';
import EditDialog from 'catalog/datasets/DatasetEditDialog';
import RevisionsDialog from 'catalog/datasets/RevisionsDialog';
import ShowIdeasDialog from 'catalog/datasets/ShowIdeasDialog';
import ShowShowcasesDialog from 'catalog/datasets/ShowResultsDialog';
import { isAPIDistribution, isUploadedDistribution } from 'catalog/datasets/utils/distributionUtil';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import { navigateToCatalogView } from 'catalog/utils/catalog';
import CommentDialog from 'commons/comments/CommentDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import escoCommentNLS from 'commons/nls/escoComment.nls';
import DOMUtil from 'commons/util/htmlUtil';

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

export default (entry) => {
  const openDialog = (dialog) => {
    // @scazan Some glue here to communicate with RDForms without a "row"
    dialog.open({
      nlsPublicTitle: 'publicDatasetTitle',
      nlsProtectedTitle: 'privateDatasetTitle',
      row: { entry, list: {} },
      list: {},
      onDone: () => m.redraw(),
    });
  };

  const CloneDialog = declare([ListDialogMixin], {
    maxWidth: 800,
    title: 'temporary',

    open(params) {
      const escaDataset = i18n.getLocalization(escaDatasetNLS);
      const datasetEntry = entry;
      const dialogs = registry.get('dialogs');
      const confirmMessage = escaDataset.cloneDatasetQuestion;
      dialogs.confirm(confirmMessage, null, null, (confirm) => {
        if (!confirm) {
          return;
        }
        const nds = createEntry(null, 'dcat:Dataset');
        const nmd = datasetEntry.getMetadata().clone()
          .replaceURI(datasetEntry.getResourceURI(), nds.getResourceURI());

        return registry.get('getGroupWithHomeContext')(nds.getContext())
          .then((groupEntry) => {
            const ei = nds.getEntryInfo();
            const acl = ei.getACL(true);
            acl.admin.push(groupEntry.getId());
            ei.setACL(acl);
          })
          .then(() => {
            nds.setMetadata(nmd);
            const title = nmd.findFirstValue(null, 'dcterms:title') || '';
            nmd.findAndRemove(null, 'dcterms:title');
            nmd.findAndRemove(null, 'dcat:distribution');
            const copyString = escaDataset.cloneCopy;
            nmd.addL(nds.getResourceURI(), 'dcterms:title', copyString + title);

            return nds.commit().then(newEntry => registry.get('entrystoreutil')
              .getEntryByType('dcat:Catalog', newEntry.getContext()).then((catalog) => {
                catalog.getMetadata().add(catalog.getResourceURI(), 'dcat:dataset', newEntry.getResourceURI());
                return catalog.commitMetadata().then(() => {
                  newEntry.setRefreshNeeded();
                  return newEntry.refresh();
                });
              }));
          })
          .then(navigateToDatasets);
      });
    },
  });

  const clone = () => {
    const cloneDialog = new CloneDialog({ entry, destroyOnHide: true }, DOMUtil.create('div'));
    cloneDialog.open();
  };
  /**
   * Open an Edit Side Dialog for this dataset
   *
   * @returns {undefined}
   */
  const openEditDialog = () => {
    const editDialog = new EditDialog({ entry, destroyOnHide: true }, DOMUtil.create('div'));

    editDialog.showEntry(entry, () => {
      entry.refresh().then(() => m.redraw());
    });
  };

  /**
   * Set this dataset as unpublished/not public
   *
   * @param {store/Entry} groupEntry
   * @param {function} onSuccess A callback called after the state has been committed
   * @returns {undefined}
   */
  const setUnpublished = (groupEntry, onSuccess) => {
    const ei = entry.getEntryInfo();
    const acl = ei.getACL(true);
    acl.admin = acl.admin || [];
    acl.admin.push(groupEntry.getId());
    ei.setACL(acl);
    // this.reRender();
    ei.commit().then(onSuccess);
    updateDistributionACL(acl, entry);
  };

  /**
   * Set this dataset as public
   *
   * @param {boolean} currentPublishedState
   * @returns {undefined}
   */
  const setPublishedState = (currentPublishedState, onSuccess) => {
    const escaDataset = i18n.getLocalization(escaDatasetNLS);
    const toggleThisImplementation = () => {
      const ns = registry.get('namespaces');
      const ei = entry.getEntryInfo();
      const dialogs = registry.get('dialogs');
      registry.get('getGroupWithHomeContext')(entry.getContext()).then((groupEntry) => {
        if (groupEntry.canAdministerEntry()) {
          if (currentPublishedState) {
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
              return setUnpublished(groupEntry, onSuccess);
            }

            const confirmMessage = escaDataset.apiExistsToUnpublishDataset;
            return dialogs.confirm(confirmMessage, null, null, (confirm) => {
              if (confirm) {
                return setUnpublished(groupEntry, onSuccess);
              }
              return null;
            });
          }

          // Make this dataset public by emptying the ACL and relying on parent
          ei.setACL({});
          ei.commit().then(onSuccess);
          updateDistributionACL({}, entry);
        } else {
          registry.get('dialogs')
            .acknowledge(escaDataset.datasetSharingNoAccess)
            .then(onSuccess);
        }

        return undefined;
      });
    };

    if (currentPublishedState) {
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

  const setInternalPublishedState = (currentPublishedState) => {
    if (currentPublishedState) {
      entry.addD('http://entryscape.com/terms/psi', 'true', 'xsd:boolean')
        .commitMetadata();
    } else {
      entry.getMetadata().findAndRemove(null, 'http://entryscape.com/terms/psi');
      entry.commitMetadata();
    }
  };

  /**
   *
   * Remove this dataset
   *
   * @params {number} noOfComments The number of comments on the dataset
   * @returns {undefined}
   */
  const removeDataset = (noOfComments) => {
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
            if (noOfComments > 0) {
              confirmMessage = i18n.renderNLSTemplate(
                escaDataset.removeDatasetDistributionsAndCommentsConfirm,
                { distributions: stmts.length, comments: noOfComments },
              );
            } else {
              confirmMessage = i18n.renderNLSTemplate(
                escaDataset.removeDatasetAndDistributionsQuestion,
                stmts.length,
              );
            }
          } else if (noOfComments > 0) {
            confirmMessage = i18n.renderNLSTemplate(
              escaDataset.removeDatasetAndCommentsConfirm,
              noOfComments,
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
                      .then(navigateToDatasets);
                  }, () => {
                    dialogs.acknowledge(escaDataset.failedToRemoveDatasetDistributions);
                  });
                });
              });
          });
        }
      });
  };

  /**
   *
   * Open the Revisions dialog for this dataset
   *
   * @returns {undefined}
   */
  const openRevisions = async () => {
    const revisionsDialog = new RevisionsDialog({ destroyOnHide: true }, DOMUtil.create('div'));

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
    const template = await Lookup.getTemplate(entry);
    revisionsDialog.open({
      row: { entry },
      onDone: () => m.redraw(),
      template,
    });
  };

  const escoComment = escoCommentNLS;
  const escaDataset = escaDatasetNLS;
  /**
   *
   * Open the Comments dialog for this dataset
   *
   * @returns {undefined}
   */
  const openComments = (onUpdate) => {
    const commentsDialog = new CommentDialog({
      destroyOnHide: true,
      nlsBundles: [{ escoComment, escaDataset }],
      open(params) {
        this.inherited('open', arguments);
        const name = registry.get('rdfutils').getLabel(params.row.entry);
        this.title = i18n.renderNLSTemplate(this.NLSLocalized.escaDataset.commentHeader, { name });
        this.footerButtonLabel = this.NLSLocalized.escaDataset.commentFooterButton;
        this.localeChange();
      },
    }, DOMUtil.create('div'));

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

  /**
   * Open the Ideas dialog for this dataset
   *
   * @returns {undefined}
   */
  const openIdeas = () => {
    const showIdeasDialog = new ShowIdeasDialog({ destroyOnHide: true }, DOMUtil.create('div'));
    openDialog(showIdeasDialog);
  };

  /**
   * Open the showcases dialog for this dataset
   *
   * @returns {undefined}
   */
  const openShowcases = () => {
    const showShowcasesDialog = new ShowShowcasesDialog({ destroyOnHide: true }, DOMUtil.create('div'));
    openDialog(showShowcasesDialog);
  };

  /**
   * Open a "dialog" (which is just a modal) fr
   *
   * @returns {undefined}
   */
  const downgrade = () => {
    const downgradeDialog = new DowngradeDialog({ destroyOnHide: true }, DOMUtil.create('div'));
    downgradeDialog.open({
      nlsPublicTitle: 'publicDatasetTitle',
      nlsProtectedTitle: 'privateDatasetTitle',
      row: { entry, list: {} },
      list: {},
      onDone: navigateToCandidates,
    });
  };

  /**
   * Open a Dataset Preview window
   *
   * @returns {undefined}
   */
  const openPreview = () => {
    /**
     * Encoded resource URI; base64 used
     * @type {string}
     */
    const dataset = entry.getId();
    const site = registry.get('siteManager');
    const state = site.getState();
    const { context } = state[state.view];

    if (config.catalog && config.catalog.previewURLNewWindow) {
      const currentView = site.getUpcomingOrCurrentView();
      const viewRoute = site.getViewRoute(currentView);
      const url = site.getRoutePath(viewRoute, { context, dataset });
      window.open(url, '_blank');
    } else {
      site.render('catalog__datasets__preview', { context, dataset });
    }
  };

  const navigateToDatasets = () => navigateToCatalogView('catalog__datasets', true);
  const navigateToCatalog = () => navigateToCatalogView('catalog__overview');
  const navigateToCandidates = () => navigateToCatalogView('catalog__candidates', true);

  return {
    openEditDialog,
    removeDataset,
    setPublishedState,
    setInternalPublishedState,
    navigateToCatalog,
    navigateToDatasets,
    openRevisions,
    openComments,
    openIdeas,
    openShowcases,
    openPreview,
    clone,
    downgrade,
  };
};
