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

export default (entry) => {
  const openDialog = (DialogClass) => {
    const dialog = new DialogClass({}, DOMUtil.create('div'));
    // @scazan Some glue here to communicate with RDForms without a "row"
    dialog.open({
      nlsPublicTitle: 'publicDatasetTitle',
      nlsProtectedTitle: 'privateDatasetTitle',
      row: { entry },
      onDone: () => m.redraw(),
    });
  };

  /**
   * Open an Edit Side Dialog for this dataset
   *
   * @returns {undefined}
   */
  const openEditDialog = () => {
    const editDialog = new EditDialog({ entry }, DOMUtil.create('div'));
    editDialog.showEntry(entry, () => {
      entry.refresh().then(() => m.redraw());
    });
  };

  /**
   * Set this dataset a unpublished/not public
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
   * @param {boolean} publishedState
   * @returns {undefined}
   */
  const setPublishedState = (publishedState) => {
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

  const setPSIPublishedState = (publishedState) => {
    console.log('For future use');
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

  /**
   *
   * Open the Revisions dialog for this dataset
   *
   * @returns {undefined}
   */
  const openRevisions = () => {
    const revisionsDialog = new RevisionsDialog({}, DOMUtil.create('div'));

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

  /**
   *
   * Open the Comments dialog for this dataset
   *
   * @returns {undefined}
   */
  const openComments = (onUpdate) => {
    const escoComment = escoCommentNLS;
    const escaDataset = escaDatasetNLS;
    const commentsDialog = new CommentDialog({
      nlsBundles: [{ escoComment, escaDataset }],
      open(params) {
        this.inherited('open', arguments);
        const name = registry.get('rdfutils').getLabel(params.row.entry);
        this.title = i18n.renderNLSTemplate(this.NLSBundles.escaDataset.commentHeader, { name });
        this.footerButtonLabel = this.NLSBundles.escaDataset.commentFooterButton;
        this.localeChange();
      },
    }, DOMUtil.create('div'));
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

  /**
   * Open the Ideas dialog for this dataset
   *
   * @returns {undefined}
   */
  const openIdeas = () => {
    openDialog(ShowIdeasDialog);
  };

  const openShowcases = () => {
    /**
     * Open the showcases dialog for this dataset
     *
     * @returns {undefined}
     */
    openDialog(ShowShowcasesDialog);
  };

  /**
   * Open a "dialog" (which is just a modal) fr
   *
   * @returns {undefined}
   */
  const downgrade = () => {
    openDialog(DowngradeDialog);
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
    if (config.catalog && config.catalog.previewURLNewWindow) {
      window.open(url, '_blank'); // @scazan TODO url is undefined but was, seemingly, also undefined in the original
    } else {
      const site = registry.get('siteManager');
      const state = site.getState();
      const { context } = state[state.view];
      site.render('catalog__datasets__preview', { context, dataset });
    }
  };

  /**
   * Navigate to the parent Catalog of this dataset
   *
   * @returns {undefined}
   */
  const navigateToCatalog = () => {
    const site = registry.get('siteManager');
    const state = site.getState();
    const { context } = state[state.view];
    site.render('catalog__datasets', { context });
  };

  return {
    openEditDialog,
    removeDataset,
    setPublishedState,
    setPSIPublishedState,
    navigateToCatalog,
    openRevisions,
    openComments,
    openIdeas,
    openShowcases,
    openPreview,
    downgrade,
  };
};
