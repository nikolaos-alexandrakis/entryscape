import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import { Graph } from 'rdfjson';
import CreatePipelineDialog from './CreatePipelineDialog';
import recipes from './util/recipes';

export default declare([CreatePipelineDialog], {
  nlsHeaderTitle: 'ePHeader',
  nlsFooterButtonLabel: 'epEdit',
  id: 'edit',
  open(params) {
    this.inherited(arguments);
    // check if this came from create or edit
    this.entry = params.row.entry;
    this.getMetadata(this.entry, true).then(this.setFormData.bind(this));
  },

  /**
   * @param entry
   * @return {Promise|Object|null}
   */
  getMetadata(entry, loadResource = false) {
    const md = entry.getMetadata();
    const ruri = entry.getResourceURI();

    const title = md.findFirstValue(ruri, 'dcterms:title');
    const description = md.findFirstValue(ruri, 'dcterms:description');
    let username = md.findFirstValue(ruri, 'foaf:mbox');
    if (username) {
      username = username.replace('mailto:', '');
    }
    const psi = md.findFirstValue(ruri, 'foaf:page');
    const orgId = md.findFirstValue(ruri, 'dcterms:identifier');

    if (loadResource) {
      const pipelineResMaybePromise = entry.getResource();

      return Promise.resolve(pipelineResMaybePromise).then((pipelineRes) => {
        const { recipe, sourceUrl } = recipes.detectRecipeAndValue(pipelineRes);
        if (recipe) {
          return {
            title, description, username, psi, orgId, recipe, sourceUrl,
          };
        }

        // couldn't detect recipe
        return null;
      });
    }

    return {
      title, description, username, psi, orgId,
    };
  },

  /**
   * Sets new metadata for a pipeline

   * @param entry
   * @param data
   * @see this.addToMetadata
   */
  setEntryMetadata(entry, data, type = null) {
    const md = new Graph();
    this.addToMetadata(md, entry.getResourceURI(), data, type);

    entry.setMetadata(md);
  },
  /**
   * Convenience function
   * @param data
   * @return {{title: *, description: *, email: *, psi: *, orgId: *}}
   */
  unpackData(data) {
    const {
      'edit--title': title,
      'edit--description': description,
      'edit--username': username,
      'edit--psi': psi,
      'edit--orgId': orgId,
      'edit--recipe': recipe,
      'edit--sourceUrl': sourceUrl,
    } = data;

    return {
      title, description, username, psi, orgId, recipe, sourceUrl,
    };
  },
  /**
   * @param values {Object|null} null value means that this is not a standard recipe pipeline
   */
  setFormData(values) {
    if (values) {
      const isAdmin = Boolean(registry.get('isAdmin'));
      const inAdminGroup = Boolean(registry.get('inAdminGroup'));
      this.formComponent.setFormData({
        bundle: this.NLSLocalized0,
        isOwnOrg: isAdmin ? false : !values.username,
        isOwnOrgEnabled: inAdminGroup,
        isPSIOrg: Boolean(values.psi),
        isPSIOrgEnabled: isAdmin || inAdminGroup,
        canChangeOwner: isAdmin || inAdminGroup,
        values,
      }, true);
    } else {
      this.formComponent.setFormData({ isStandardRecipe: false }, true);
    }
  },

  /**
   * Creates/saves data at multiple entries :
   *  - PipelineEntry (metadata + resource)
   *  - GroupEntry (title)
   *  - ContextEntry (title)
   *
   * @return {*}
   */
  async footerButtonAction() {
    const context = this.entry.getContext();
    const contextEntry = await context.getEntry();
    const bundle = this.NLSLocalized0;
    const data = this.getFormData();

    try {
      // upate the metadata of the pipeline entry
      this.setEntryMetadata(this.entry, data);
      await this.entry.commitMetadata();
    } catch (e) {
      throw Error('There was some error while trying to update the Pipeline');
    }

    let groupEntry = null;
    try {
      groupEntry = await context.getHomeContextOf(); // group or user (TODO check)
    } catch (e) {
      // No user or group that has this context as home context
    }

    // update owner user
    try {
      const { username } = data;
      if (username) {
        await this.replaceUser(groupEntry, contextEntry, username);
        groupEntry.setRefreshNeeded();
        await groupEntry.refresh();
      }
    } catch (e) {
      throw Error(bundle.replaceUserErrorMessage);
    }

    try {
      // replace the pipeline resource
      // 1. remove all transforms
      // 2. add new ones according to the data
      const {
        title, psi, recipe, sourceUrl,
      } = data;
      const pipRes = await this.entry.getResource();
      pipRes.getTransforms().forEach(pipRes.removeTransform, pipRes);
      recipes.toArray(recipe, { psi, source: sourceUrl, name: title })
        .forEach(transform => pipRes.addTransform(transform[0], transform[1]));

      await pipRes.commit();
    } catch (e) {
      throw Error('There was some error while trying to edit pipeline resource');
    }

    try {
      // Set group title
      const { title } = data;
      const groupMd = new Graph();
      groupMd.addL(groupEntry.getResourceURI(), 'dcterms:title', title);
      groupEntry.setMetadata(groupMd);
      await groupEntry.commitMetadata();
    } catch (e) {
      throw Error('There was some error while trying to edit the group of the pipeline');
    }

    try {
      // Add title to the context metadata
      const { title } = data;
      contextEntry.setRefreshNeeded(true);
      await contextEntry.refresh();
      contextEntry.getMetadata().addL(contextEntry.getResourceURI(), 'dcterms:title', title);
      await contextEntry.commitMetadata();
    } catch (e) {
      throw Error('There was some error while trying to edit the home context of the' +
        ' pipeline');
    }


    const view = this.list.getView();
    view.action_refresh();
  },
});
