import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import { i18n } from 'esi18n';
import DOMUtil from 'commons/util/htmlUtil';
import EditDialog from 'catalog/datasets/DatasetEditDialog';
import RevisionsDialog from 'catalog/datasets/RevisionsDialog';
import CommentDialog from 'commons/comments/CommentDialog';
import ShowIdeasDialog from 'catalog/datasets/ShowIdeasDialog';
import ShowShowcasesDialog from 'catalog/datasets/ShowResultsDialog';
import {
  getDistributionTemplate,
} from 'catalog/datasets/utils/distributionUtil';

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
      // nlsPublicTitle: 'publicDatasetTitle',
      // nlsProtectedTitle: 'privateDatasetTitle',
      row: { entry },
      onDone: () => m.redraw(),
    });
  };

  const editDialog = new EditDialog({ entry }, DOMUtil.create('div', null, dom));
  const openEditDialog = () => {
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
    const onSuccess = () => m.redraw;
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
            // const confirmMessage = this.nlsSpecificBundle[this.list.nlsApiExistsToUnpublishDataset]; // @scazan THIS
            const confirmMessage = "CHANGE THIS"; // @scazan THIS
            return dialogs.confirm(confirmMessage, null, null, (confirm) => {
              if (confirm) {
                return unpublishDataset(groupEntry, onSuccess);
              }
              return null;
            });
          }

          // Make this dataset public by emptying the ACL and relying on parent
          ei.setACL({});
          // this.reRender();
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

  // @scazan CODE is DUPLICATED SOMEWHAT
  const openRevisions = () => {
    // const dv = RevisionsDialog;
    // if (isUploadedDistribution(distribution, registry.get('entrystore'))) {
      // dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL'];
    // } else if (isAPIDistribution(distribution)) {
      // dv.excludeProperties = ['dcat:accessURL', 'dcat:downloadURL', 'dcterms:source'];
    // } else {
      // dv.excludeProperties = [];
    // }
    // dv.excludeProperties = dv.excludeProperties.map(property => registry.get('namespaces').expand(property));

    const revisionsDialog = new RevisionsDialog({}, DOMUtil.create('div', null, dom));
    // @scazan Some glue here to communicate with RDForms without a "row"
    revisionsDialog.open({
      row: { entry },
      onDone: () => m.redraw(),
      template: getDistributionTemplate(config.catalog.distributionTemplateId),
    });
  };

  const openComments = () => {
    const commentsDialog = new CommentDialog({}, DOMUtil.create('div', null, dom));
    // @scazan Some glue here to communicate with RDForms without a "row"
    commentsDialog.open({
      nlsPublicTitle: 'publicDatasetTitle',
      nlsProtectedTitle: 'privateDatasetTitle',
      row: { entry },
      onDone: () => m.redraw(),
    });
  };


  const openIdeas = () => {
    openDialog(ShowIdeasDialog);
  };

  const openShowcases = () => {
    openDialog(ShowShowcasesDialog);
  };

  const openPreview = () => {
    /**
     * Encoded resource URI; base64 used
     * @type {string}
     */
    const dataset = entry.getId();
    if (config.catalog && config.catalog.previewURLNewWindow) {
      window.open(url, '_blank');
    } else {
      const site = registry.get('siteManager');
      const state = site.getState();
      const { context } = state[state.view];
      site.render('catalog__datasets__preview', { context, dataset });
    }
  };

  return {
    openEditDialog,
    setPublished,
    openRevisions,
    openComments,
    openIdeas,
    openShowcases,
    openPreview,
  };
};
