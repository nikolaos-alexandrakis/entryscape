import TitleDialog from 'commons/dialog/TitleDialog';
import registry from 'commons/registry';
import config from 'config';
import declare from 'dojo/_base/declare';
import m from 'mithril';
import esreHarvest from 'registry/nls/esreHarvest.nls';
import PipelineFormComponent from './components/PipelineFormComponent';
import recipes from './util/recipes';

export default declare([TitleDialog.ContentNLS], {
  templateString: '<div class="esrePipelineCreateDialog"><div data-dojo-attach-point="__formInput"></div></div>',
  nlsBundles: [{ esreHarvest }],
  nlsHeaderTitle: 'cOHeader',
  nlsFooterButtonLabel: 'cPButton',
  type2template: null,
  id: 'create',
  recipes: config.registry.recipes,
  _skipNodeCache: true,

  constructor(params) {
    this.list = params.list;
  },

  postCreate() {
    this.inherited(arguments);
    registry.onChange('userEntry', this.redrawFormComponent.bind(this));
  },
  /**
   * User entry changed, redraw component
   */
  redrawFormComponent(emptyValues = true) {
    if (this.formComponent) {
      const isAdmin = Boolean(registry.get('isAdmin'));
      const inAdminGroup = Boolean(registry.get('inAdminGroup'));
      const values = emptyValues ? {
        title: '',
        description: '',
        username: '',
        psi: '',
        orgId: '',
        sourceUrl: '',
      } : {};
      this.formComponent.setFormData({
        bundle: this.NLSLocalized0,
        isOwnOrg: !(isAdmin || inAdminGroup),
        isOwnOrgEnabled: inAdminGroup,
        isPSIOrg: isAdmin || inAdminGroup,
        isPSIOrgEnabled: isAdmin || inAdminGroup,
        canChangeOwner: isAdmin || inAdminGroup,
        values,
      }, true);
    }
  },
  localeChange() {
    this.inherited(arguments);
    if (!this.formComponent) {
      const isAdmin = Boolean(registry.get('isAdmin'));
      const inAdminGroup = Boolean(registry.get('inAdminGroup'));
      // create components and mount
      this.formComponent = new PipelineFormComponent({
        id: this.id,
        bundle: this.NLSLocalized0,
        isOwnOrg: !(isAdmin || inAdminGroup),
        isOwnOrgEnabled: inAdminGroup,
        isPSIOrg: isAdmin || inAdminGroup,
        isPSIOrgEnabled: isAdmin || inAdminGroup,
        canChangeOwner: isAdmin || inAdminGroup,
        recipes: this.recipes,
        onValid: this.dialog.unlockFooterButton.bind(this.dialog), // call when form is valid
        onInvalid: this.dialog.lockFooterButton.bind(this.dialog), // ... when invalid
      });

      // first time rendering, lock the footer button
      this.dialog.lockFooterButton();

      m.mount(this.__formInput, this.formComponent);
    }
  },
  open() {
    this.dialog.show();
    this.redrawFormComponent();
  },

  getFormData() {
    return this.unpackData(this.formComponent.getFormData());
  },
  async makeOwner(entryToOwn, userEntry) {
    // add new user to rwrite of the group
    const entryInfo = entryToOwn.getEntryInfo();
    const acl = entryInfo.getACL(true);
    const { admin } = acl;

    if (!admin.includes(userEntry.getId())) {
      admin.push(userEntry.getId());
      entryInfo.setACL(acl);

      await entryInfo.commit();
    }
  },
  /**
   * If the user with a certain username does not exist :
   *  - create user
   *  - add acl for group
   *  - remove current user from all entries' acl in group and add the new user to them
   *
   * If the user with a certain username exists then return the user entry
   *
   * @param groupEntry
   * @param contextEntry
   * @param username
   */
  async replaceUser(groupEntry, contextEntry, username) {
    const entrystore = registry.get('entrystore');
    const currentUser = await registry.get('userInfo');

    if (currentUser.user !== username) {
      let newUserEntry;
      const data = await entrystore.getREST().get(`${entrystore.getBaseURI()}_principals?entryname=${username}`);
      if (data.length > 0) {
        // return existing userEntry
        const userEntryId = data[0];
        newUserEntry = await entrystore.getContextById('_principals').getEntryById(userEntryId);
      } else {
        // Create new userEntry, and make sure its metadata is public
        const nu = entrystore.newUser(username);
        const ei = nu.getEntryInfo();
        const nuACL = ei.getACL(true);
        nuACL.mread.push('_guest');
        ei.setACL(nuACL);
        newUserEntry = await nu.commit();
      }

      // add new user to rwrite of the group
      this.makeOwner(groupEntry, newUserEntry);
      this.makeOwner(contextEntry, newUserEntry);

      // remove current user from all entries' acl in group, and add the new user to all of them
      const entryIds = await groupEntry.getResource(true).getAllEntryIds();
      const loggedUserEntry = registry.get('userEntry');
      entryIds.splice(entryIds.indexOf(loggedUserEntry.getId()), 1);
      entryIds.push(newUserEntry.getId());
      await groupEntry.getResource(true).setAllEntryIds(entryIds);
    }
  },
  /**
   * Just a helper function to avoid duplicate code
   * @param {rdfjson/Graph} md
   * @param {Object} data
   */
  addToMetadata(md, ruri, data, type = null) {
    const {
      title, description, username, psi, orgId,
    } = data;

    md.addL(ruri, 'dcterms:title', title);
    md.addL(ruri, 'dcterms:description', description);
    md.addL(ruri, 'dcterms:subject', 'opendata');
    if (psi) {
      md.addL(ruri, 'dcterms:subject', 'psi');
      md.add(ruri, 'foaf:page', psi);
    }
    if (orgId) {
      md.addL(ruri, 'dcterms:identifier', orgId);
    }
    if (username) {
      md.add(ruri, 'foaf:mbox', `mailto:${username}`);
    } else if (!registry.get('isAdmin')) {
      const res = registry.get('userEntry').getResource(true);
      md.add(ruri, 'foaf:mbox', `mailto:${res.getSource().name}`);
    }

    if (type) {
      md.add(ruri, 'rdf:type', type);
    }
  },
  unpackData(data) {
    const {
      'create--title': title,
      'create--description': description,
      'create--username': username,
      'create--psi': psi,
      'create--orgId': orgId,
      'create--recipe': recipe,
      'create--sourceUrl': sourceUrl,
    } = data;

    return {
      title, description, username, psi, orgId, recipe, sourceUrl,
    };
  },
  /**
   * Creates/saves data at multiple entries :
   *  - GroupEntry
   *  - PipelineEntry
   *  - ContextEntry
   * @return {*}
   */
  footerButtonAction() {
    const bundle = this.NLSLocalized0;
    const entrystore = registry.get('entrystore');
    const data = this.getFormData();

    // create context and group
    return entrystore.createGroupAndContext().then(async (groupEntry) => {
      const homeContextId = groupEntry.getResource(true).getHomeContext();
      const homeContext = entrystore.getContextById(homeContextId);
      const contextEntry = await homeContext.getEntry();

      try {
        const { username } = data;
        if (username) {
          await this.replaceUser(groupEntry, contextEntry, username);
          groupEntry.setRefreshNeeded();
          await groupEntry.refresh();
        }
        // Set group title
        const { title } = data; // => const title = data['create--title'];
        groupEntry.getMetadata().addL(groupEntry.getResourceURI(), 'dcterms:title', title);
        await groupEntry.commitMetadata();
      } catch (e) {
        throw Error(bundle.replaceUserErrorMessage);
      }

      // Add title to the context metadata
      try {
        const { title } = data;
        contextEntry.addL('dcterms:title', title);
        await contextEntry.commitMetadata();

        // Make the context a esterms:CatalogContext
        const hcEntryInfo = contextEntry.getEntryInfo();
        hcEntryInfo.getGraph().add(contextEntry.getResourceURI(), 'rdf:type', 'esterms:CatalogContext');
        // TODO remove when entrystore is changed so groups have read access to
        // homecontext metadata by default.
        // Start fix with missing metadata rights on context for group
        const acl = hcEntryInfo.getACL(true);
        acl.mread.push(groupEntry.getId());
        acl.mwrite.push(groupEntry.getId());
        hcEntryInfo.setACL(acl);
        // End fix
        hcEntryInfo.commit();
      } catch (e) {
        throw Error('There was some error while trying to set the home context title');
      }

      const protoPipeline = homeContext.newPipeline();
      let protoEntry; // the entry we get when protoPipelin is committed
      try {
        const {
          name, psi, recipe, sourceUrl,
        } = data;
        // Create PipelineEntry and add metadata
        const pipelineResource = protoPipeline.getResource();
        recipes.toArray(recipe, { name, psi, source: sourceUrl })
          .forEach(transform => pipelineResource.addTransform(transform[0], transform[1]));

        const pmd = protoPipeline.getMetadata();
        this.addToMetadata(pmd, pipelineResource.getResourceURI(), data);
        protoEntry = await protoPipeline.commit();
      } catch (e) {
        throw Error('There was some error while trying to create the pipeline entry/resource');
      }

      // show new pipeline in list
      const view = this.list.getView();
      view.addRowForEntry(protoEntry);
    });
  },
});
