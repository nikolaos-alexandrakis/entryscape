import m from 'mithril';
import DOMUtil from 'commons/util/htmlUtil';
import StatBox from 'commons/overview/components/StatBox';
import Toggle from 'commons/components/common/toggle/Toggle';
import { createSetState } from 'commons/util/util';
import { i18n } from 'esi18n';
import EditDialog from 'catalog/datasets/DatasetEditDialog';
import DistributionList from './DistributionList';
import MoreMetadata from './MoreMetadata';
import escaPublicNLS from 'catalog/nls/escaPublic.nls';
import escaDatasetNLS from 'catalog/nls/escaDataset.nls';
import './Overview.scss';

export default (vnode) => {
  const { entry } = vnode.attrs;
  const resourceURI = entry.getResourceURI();
  const entryInfo = entry.getEntryInfo();

  const editDialog = new EditDialog({ entry }, DOMUtil.create('div', null, vnode.dom));

  const state = {
    isHidden: true,
    isPublish: false,
    isInternalPublish: false,
  };

  const setState = createSetState(state);

  const toggleMetadata = () => {
    setState({ isHidden: !state.isHidden });
  };



  const toggleImplementation = (onSuccess) => {
    /*
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
    */
  };

  const unpublishDataset = (entryInfo, groupEntry) => {
    const acl = entryInfo.getACL(true);
    acl.admin = acl.admin || [];
    acl.admin.push(groupEntry.getId());
    entryInfo.setACL(acl);
    // this.reRender();
    ei.commit().then(() => m.redraw());
    // this.updateDistributionACL(acl);
  };

  const togglePublish = () => {
    setState({ isPublish: !state.isPublish });
  };

  const toggleInternalPublish = () => {
    setState({ isInternalPublish: !state.isInternalPublish });
  };

  const openEditDialog = () => {
    editDialog.showEntry(entry, () => {
      entry.refresh().then(() => m.redraw());
    });
  };

  return {
    view: () => {
      const entryInfo = entry.getEntryInfo();
      const metadata = entry.getMetadata();
      const title = metadata.findFirstValue(resourceURI, 'dcterms:title');
      const description = metadata.findFirstValue(resourceURI, 'dcterms:description');
      const internalPublishClass = state.isInternalPublish ? '' : 'fa-rotate-180';

      const escaDataset = i18n.getLocalization(escaDatasetNLS);
      const escaPublic = i18n.getLocalization(escaPublicNLS);

      return (
        <main class="overview__wrapper">
          <div class="flex--sb">
            <div class="metadata--wrapper">
              <div class="intro--wrapper">
                <h2 class="title">{ title }</h2>
                <p class="description">{ description }</p>
              </div>
              <div class="metadata--basic">
              <p><span class="metadata__label">{escaPublic.datasetBelongsToCatalog}</span> Name of catalog</p>
              <p><span class="metadata__label">{escaDataset.themeTitle}:</span> Art</p>
              <p><span class="metadata__label">{escaDataset.lastUpdateLabel}:</span> 16:57</p>
              <p><span class="metadata__label">{escaDataset.editedTitle}</span> Althea Espejo, Valentino Hudra</p>
          </div>

            </div>
            

            <div class="btn__wrapper">
              <button class="btn--action btn--edit" onclick={openEditDialog}>{escaDataset.editDatasetTitle}</button>
              <button class="btn--action btn--show" onclick={toggleMetadata}>{escaDataset.showMoreTitle}</button>
              <div class=" externalPublish flex--sb">
                <div class="icon--wrapper">
                  <span class="icons fa fa-globe"></span>
                  <p class="published">{escaDataset.publicDatasetTitle}</p>
                </div>
                <Toggle isPublish={state.isPublish} onToggle={togglePublish}></Toggle>
              </div>
              <div class="internalPublish flex--sb">
                <div class="icon--wrapper">
                  <span class="icons fa fa-eye"></span>
                  <p class="unpublished">{escaDataset.privateDatasetTitle}</p>
                </div>
                <button class={`fa fa-toggle-on fa-lg  btn--publish ${internalPublishClass}`} onclick={toggleInternalPublish}></button>
              </div>
            </div>
          </div>

          

          <div class="metadata--wrapper">
            <MoreMetadata isHidden={state.isHidden} metadata={entryInfo}></MoreMetadata>
          </div>

          <div class="flex--sb">
            <DistributionList dataset={entry}></DistributionList>
            <div class="cards--wrapper">
              <StatBox value="3" label={escaDataset.commentMenu} link=""/>
              <StatBox value="2" label={escaDataset.showideas} link=""/>
              <StatBox value="0" label={escaDataset.showresults} link=""/>
            </div>


          </div>


        </main>
      );
    },
  };
};
