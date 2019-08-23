import { i18n } from 'esi18n';
import config from 'config';
import registry from 'commons/registry';
import { types } from 'store';
import declare from 'dojo/_base/declare';
import BaseList from '../list/common/BaseList';
import ViewPlaceholder from '../placeholder/ViewPlaceholder';
import GCEList from './GCEList';
import GCERow from './GCERow';


const OpenGCE = declare([], {
  open(params) {
    const site = registry.getSiteManager();
    const view = params.row.list.rowClickView;
    const context = params.row.getContext().getId();

    site.render(view, { context });
  },
});

export default declare([BaseList], {
  includeCreateButton: true,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  includeExpandButton: false,
  nlsGCEPublicTitle: '',
  nlsGCEProtectedTitle: '',
  nlsGCESharingNoAccess: '',
  nlsGCEConfirmRemoveRow: '',
  nlsGroupSharingProblem: '',
  rowClass: GCERow,
  rowClickDialog: 'openGCE',
  rowClickView: '',
  entryType: '',
  graphType: '',
  contextType: '',
  entriesAreContextEntries: false,
  searchInList: true,
  searchVisibleFromStart: false,
  placeholderClass: ViewPlaceholder,
  nlsHeaderInfoKey: 'headerInfo',

  postCreate() {
    this.entriesAreContextEntries = this.entryType == null || this.entryType === '';
    this.inherited('postCreate', arguments);
    this.registerDialog('openGCE', OpenGCE);
  },

  render() {
    if (registry.get('hasAdminRights')) {
      this.getView().expandButton.style.display = '';
    } else {
      this.getView().expandButton.style.display = 'none';
    }
    this.inherited(arguments);
  },

  updateLocaleStrings(generic, specific) {
    if (specific) {
      this.nlsSpecificBundle = specific || this.nlsSpecificBundle;
      const nlsText = specific && (specific[this.nlsHeaderInfoKey] || '');
      if (nlsText !== '') {
        this.getView().headerInfo.style.display = 'block';
        // domAttr.set(this.getView().listInfo, 'innerHTML', nlsText);
        this.getView().listInfo.innerHTML = nlsText;
      } else {
        this.getView().headerInfo.style.display = 'none';
      }
    }
    this.inherited(arguments);
  },

  rowMetadataUpdated(row, onlyRefresh) {
    this.inherited(arguments);
    const context = row.getContext();
    const es = context.getEntryStore();

    const label = row.getRenderName();
    if (onlyRefresh) {
      return;
    }

    // Update the group name, but only if there is a single group
    // that have the context as homeContext
    const updateGroupForContext = function (contextEntry) {
      const hcs = contextEntry.getReferrers('store:homeContext');
      if (hcs.length === 1) {
        const groupURI = es.getEntryURIFromURI(hcs[0]);
        es.getEntry(groupURI).then((groupEntry) => {
          const md = groupEntry.getMetadata();
          md.findAndRemove(null, 'foaf:name');
          md.addL(groupEntry.getResourceURI(), 'foaf:name', label);
          groupEntry.commitMetadata().then(() => {
            groupEntry.setRefreshNeeded(true);
          });
        });
      }
    };

    if (!this.entriesAreContextEntries) {
      // Must force load context entry since it's modification date is
      // updated whenever a containing entry is changed.
      es.getEntry(context.getEntryURI(), { forceLoad: true }).then((contextEntry) => {
        // Update the context title
        const md = contextEntry.getMetadata();
        md.findAndRemove(null, 'dcterms:title');
        md.addL(contextEntry.getResourceURI(), 'dcterms:title', label);
        contextEntry.commitMetadata().then(() => {
          contextEntry.setRefreshNeeded(true);
        });

        updateGroupForContext(contextEntry);
      });
    } else {
      updateGroupForContext(row.entry);
    }
  },

  installActionOrNot(params, row) {
    if (!registry.get('hasAdminRights')) {
      // Should work for non-administrators as then the contextEntry has been searched
      // for before accessing the entry within (such as an dcat:Catalog)
      // and is therefore in cache
      const contextEntry = row.getContext().getEntry(true);
      switch (params.name) {
        case 'edit':
          return contextEntry.canWriteMetadata();
        case 'remove':
          return contextEntry.canAdministerEntry();
        case 'info':
          return contextEntry.canReadMetadata();
        default:
      }
    }
    return this.inherited(arguments);
  },

  search(paramsParam) {
    const params = paramsParam || {};
    if (!registry.get('hasAdminRights')) {
      const userEntry = registry.get('userEntry');
      this.entryList = new GCEList({
        userEntry,
        entryType: this.entryType,
        graphType: this.graphType,
        contextType: this.contextType,
        term: params.term,
        sortOrder: params.sortOrder,
      });
      this.listView.showEntryList(this.entryList);
    } else if (!this.entryType && !this.userEntry && !this.graphType) {
      const query = registry.get('entrystore').newSolrQuery().graphType(types.GT_CONTEXT);
      if (this.contextType !== '') {
        query.rdfType(this.contextType);
      }
      if (params.term != null && params.term.length > 0) {
        if (config.entrystore.defaultSolrQuery === 'all') {
          query.all(params.term);
        } else {
          query.title(params.term);
        }
      }
      if (config.entrystore.defaultSolrLimit) {
        query.limit(config.entrystore.defaultSolrLimit);
      }
      if (params.sortOrder === 'title') {
        const language = i18n.getLocale();
        query.sort(`title.${language}+asc`);
      }
      this.listView.showEntryList(query.list());
    } else {
      this.inherited(arguments);
    }
  },
});
