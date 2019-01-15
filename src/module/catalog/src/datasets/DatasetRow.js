import registry from 'commons/registry';
import comments from 'commons/comments/comments';
import ToggleRow from 'commons/list/common/ToggleRow';
import htmlUtil from 'commons/util/htmlUtil';
import config from 'config';
import { i18n } from 'esi18n';
import declare from 'dojo/_base/declare';
import DistributionRow from './DistributionRow';
import template from './DatasetRowTemplate.html';
import './dataset.css';

/**
 * @module catalog/datasets/DatasetRow
 */
export default declare([ToggleRow], {
  templateString: template,
  nlsPublicTitle: 'publicDatasetTitle',
  nlsProtectedTitle: 'privateDatasetTitle',

  postCreate() {
    this.inherited('postCreate', arguments);
    this.entry.getContext().getEntry().then((contextEntry) => {
      this.catalogPublic = contextEntry.isPublic();
      this.setToggled(contextEntry.isPublic(), this.entry.isPublic());
      this.renderCol4();
      if (this.nlsSpecificBundle) {
        this._updateLocaleStrings();
      }
    });
    this.listDistributions();
  },
  updateLocaleStrings() {
    this.inherited('updateLocaleStrings', arguments);
    this._updateLocaleStrings();
  },
  _updateLocaleStrings() {
    if (!this.catalogPublic) {
      this.protectedNode.setAttribute('title', this.nlsSpecificBundle.privateDisabledDatasetTitle);
    } else {
      this.protectedNode.setAttribute('title', this.nlsSpecificBundle[this.nlsProtectedTitle]);
    }
    this.removeBrokenDatasetRefs.innerHTML = this.nlsSpecificBundle.removeBrokenDatasetRefs;
    this.removeBrokenDatasetRefsWarning.innerHTML = this.nlsSpecificBundle.removeBrokenDatasetRefsWarning;
    this.maybeUpdate();
  },
  getDistributionStatements() {
    return this.entry.getMetadata().find(this.entry.getResourceURI(), 'dcat:distribution');
  },
  listDistributions() {
    const esu = registry.get('entrystoreutil');
    this.fileEntryURIs = [];
    this.uri2Format = [];
    const self = this;
    const stmts = this.getDistributionStatements() || [];
    Promise.all(stmts.map((stmt) => {
      const ruri = stmt.getValue();
      return esu.getEntryByResourceURI(ruri).then((entry) => {
        const source = entry.getMetadata().findFirstValue(entry.getResourceURI(), 'dcterms:source');
        if (source !== '' && source != null) {
          self.fileEntryURIs.push(source);
        }
        const format = entry.getMetadata().findFirstValue(entry.getResourceURI(), 'dcterms:format');
        if (format !== '' && format != null) {
          // self.uri2Format[entry.getResourceURI()] = format;
          // let uri2FormatObj = {};
          self.uri2Format[entry.getResourceURI()] = format;
          // self.uri2Format.push(uri2FormatObj);
        }
        return entry;
      }, () => {
        self.brokenReferences.style.display = '';
        // fail silently for missing distributions, list those that do exist.
        return null;
      });
    })).then(this.showDistributionInList.bind(this));
  },
  showDistributionInList(dists) {
    const distsArray = Array.isArray(dists) ? dists : [dists];
    distsArray.forEach((distE) => {
      if (distE != null) {
        DistributionRow({ entry: distE, datasetRow: this, dctSource: this.fileEntryURIs, uri2Format: this.uri2Format },
          htmlUtil.create('tbody', null, this.distributions));
      }
    });
  },
  removeBrokenReferences() {
    const store = registry.get('entrystore');
    const cache = store.getCache();
    const ns = registry.get('namespaces');
    const md = this.entry.getMetadata();
    const datasetResourceURI = this.entry.getResourceURI();
    const stmts = this.getDistributionStatements();
    stmts.forEach((stmt) => {
      const ruri = stmt.getValue();
      const euri = store.getEntryURI(store.getContextId(ruri), store.getEntryId(ruri));
      if (cache.get(euri) == null) {
        md.findAndRemove(datasetResourceURI, ns.expand('dcat:distribution'),
          { type: 'uri', value: ruri });
      }
    });
    this.entry.commitMetadata().then(() => {
      this.brokenReferences.style.display = 'none';
    }, err => alert(err));
  },
  unpublishDataset(groupEntry, onSuccess) {
    const ei = this.entry.getEntryInfo();
    const acl = ei.getACL(true);
    acl.admin = acl.admin || [];
    acl.admin.push(groupEntry.getId());
    ei.setACL(acl);
    this.reRender();
    ei.commit().then(onSuccess);
    this.updateDistributionACL(acl);
  },
  toggleImpl(onSuccess) {
    const f = () => {
      const ns = registry.get('namespaces');
      const ei = this.entry.getEntryInfo();
      const dialogs = registry.get('dialogs');
      registry.get('getGroupWithHomeContext')(this.entry.getContext()).then((groupEntry) => {
        if (groupEntry.canAdministerEntry()) {
          if (this.isPublicToggle) {
            const apiDistributionURIs = [];
            const esu = registry.get('entrystoreutil');
            const stmts = this.getDistributionStatements();
            Promise.all(stmts.forEach((stmt) => {
              const ruri = stmt.getValue();
              esu.getEntryByResourceURI(ruri).then((entry) => {
                const source = entry.getMetadata().findFirstValue(entry.getResourceURI(), ns.expand('dcterms:source'));
                if (source !== '' && source != null) {
                  apiDistributionURIs.push(source);
                }
              }, () => {
              }); // fail silently
            }));
            if (apiDistributionURIs.length === 0) {
              return this.unpublishDataset(groupEntry, onSuccess);
            }
            const confirmMessage = this.nlsSpecificBundle[this.list.nlsApiExistsToUnpublishDataset];
            return dialogs.confirm(confirmMessage, null, null, (confirm) => {
              if (confirm) {
                return this.unpublishDataset(groupEntry, onSuccess);
              }
              return null;
            });
          }
          ei.setACL({});
          this.reRender();
          ei.commit().then(onSuccess);
          this.updateDistributionACL({});
        } else {
          registry.get('dialogs').acknowledge(this.nlsSpecificBundle.datasetSharingNoAccess);
        }
      });
    };

    if (this.isPublicToggle) {
      const es = registry.get('entrystore');
      const adminRights = registry.get('hasAdminRights');
      const userEntry = registry.get('userEntry');
      const ccg = config.catalog.unpublishDatasetAllowedFor;
      const allowed = ccg === '_users' ? true :
        userEntry.getParentGroups().indexOf(es.getEntryURI('_principals', ccg)) >= 0;
      if (!adminRights && !allowed) {
        registry.get('dialogs').acknowledge(this.nlsSpecificBundle.unpublishProhibited);
        return;
      }
    } else if (this.entry.getMetadata().find(null, 'dcat:distribution').length === 0) {
      const b = this.nlsSpecificBundle;
      registry.get('dialogs').confirm(
        b.confirmPublishWithoutDistributions,
        b.proceedPublishWithoutDistributions,
        b.cancelPublishWithoutDistributions).then(f);
      return;
    }
    f();
  },
  action_remove() {
    const self = this;
    const dialogs = registry.get('dialogs');
    const store = registry.get('entrystore');
    const ns = registry.get('namespaces');
    const cache = store.getCache();
    const stmts = this.getDistributionStatements();

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
    })).then(() => {
      if (apiDistributionURIs.length > 0 && fileDistributionURIs.length > 0) {
        dialogs.acknowledge(this.nlsSpecificBundle.removeDatasetWithFileAndApiDistributions);
        return;
      } else if (apiDistributionURIs.length > 0) {
        dialogs.acknowledge(this.nlsSpecificBundle.removeFileDistAPI);
        return;
      } else if (fileDistributionURIs.length > 0) {
        dialogs.acknowledge(this.nlsSpecificBundle.removeDatasetWithFileDistributions);
        return;
      }
      if (apiDistributionURIs.length === 0 && fileDistributionURIs.length === 0) {
        let confirmMessage;
        if (stmts.length > 0) {
          if (self.noOfComments > 0) {
            confirmMessage = i18n.renderNLSTemplate(
              this.nlsSpecificBundle.removeDatasetDistributionsAndCommentsConfirm,
              { distributions: stmts.length, comments: self.noOfComments },
            );
          } else {
            confirmMessage = i18n.renderNLSTemplate(
              this.nlsSpecificBundle.removeDatasetAndDistributionsQuestion,
              stmts.length,
            );
          }
        } else if (self.noOfComments > 0) {
          confirmMessage = i18n.renderNLSTemplate(
            this.nlsSpecificBundle.removeDatasetAndCommentsConfirm,
            self.noOfComments,
          );
        } else {
          confirmMessage = this.nlsSpecificBundle.removeDatasetQuestion;
        }
        dialogs.confirm(confirmMessage, null, null, (confirm) => {
          if (!confirm) {
            return;
          }
          const dists = stmts.filter(stmts.map((stmt) => {
            const ruri = stmt.getValue();
            return cache.getByResourceURI(ruri);
          }), dist => dist.length > 0);

          es.newSolrQuery()
            .uriProperty('oa:hasTarget', this.entry.getResourceURI()).rdfType('oa:Annotation')
            .list()
            .getEntries(0)
            .then((allComments) => {
              Promise.all(allComments.map(comment => comment.del())).then(() => {
                Promise.all(dists.map(dist => dist[0].del())).then(() => {
                  const resURI = this.entry.getResourceURI();
                  return this.entry.del().then(() => {
                    this.list.getView().removeRow(this);
                    this.destroy();
                  }).then(() => registry.get('entrystoreutil').getEntryByType('dcat:Catalog', this.entry.getContext())
                    .then((catalog) => {
                      catalog.getMetadata().findAndRemove(null, ns.expand('dcat:dataset'), {
                        value: resURI,
                        type: 'uri',
                      });
                      return catalog.commitMetadata();
                    }));
                }, () => {
                  this.distributions.innerHTML = '';
                  this.listDistributions();
                  dialogs.acknowledge(this.nlsSpecificBundle.failedToRemoveDatasetDistributions);
                });
              });
            });
        });
      }
    });
  },
  action_preview() {
    /**
     * Encoded resource URI; base64 used
     * @type {string}
     */
    const dataset = this.entry.getId();
    if (config.catalog && config.catalog.previewURLNewWindow) {
      window.open(url, '_blank');
    } else {
      const site = registry.get('siteManager');
      const state = site.getState();
      const { context } = state[state.view];
      site.render('catalog__datasets__preview', { context, dataset });
    }
  },
  clearDistributions() {
    this.distributions.innerHTML = '';
  },
  /**
   * Update all distributions of the current dataset with an ACL.
   *
   * @param acl ACL object
   */
  updateDistributionACL(acl) {
    const stmts = this.getDistributionStatements();
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
  },
  renderCol4() {
    // badgeNode
    comments.getNrOfComments(this.entry).then((nr) => {
      this.noOfComments = nr;
      if (nr > 0) {
        this.badgeNode.style.display = '';
        this.badgeNode.innerHTML = nr;
        this.maybeUpdate();
      }
    });
  },

  decreaseReplyCount() {
    this.noOfComments -= 1;
    this.renderCommentCount();
  },

  renderCommentCount() {
    // badgeNode
    if (this.noOfComments > 0) {
      this.badgeNode.style.display = '';
      this.badgeNode.innerHTML = this.noOfComments;
    } else {
      this.badgeNode.style.display = 'none';
    }
    this.maybeUpdate();
  },
  maybeUpdate() {
    if (this.nlsSpecificBundle) {
      if (this.noOfComments > 0) {
        const tStr = i18n.renderNLSTemplate(
          this.nlsSpecificBundle.commentTitle,
          this.noOfComments,
        );
        this.badgeNode.setAttribute('title', tStr);
      }
    }
  },
  openCommentDialog(ev) {
    this.list.openDialog('comment', { row: this });
    ev.stopPropagation();
  },
});
