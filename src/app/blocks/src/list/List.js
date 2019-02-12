import jquery from 'jquery';
import DOMUtil from 'commons/util/htmlUtil';
import { NLSMixin } from 'esi18n';
import escoList from 'commons/nls/escoList.nls';
import escoErrors from 'commons/nls/escoErrors.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import config from 'blocks/config/config';
import List from 'commons/list/List';
import ListView from 'commons/list/ListView';
import EntryRow from 'commons/list/EntryRow';
import registry from 'commons/registry';
import ArrayList from 'commons/store/ArrayList';
import handlebars from 'blocks/boot/handlebars';
import error from 'blocks/boot/error';
import constraints from 'blocks/utils/constraints';
import dependencyList from 'blocks/utils/dependencyList';
import filter from 'blocks/utils/filter';
import MetadataExpandRow from './MetadataExpandRow';
import TemplateExpandRow from './TemplateExpandRow';

class PlaceHolder {
  constructor(args, node) {
    this.list = args.list;
    this.domNode = node;
    const conf = this.list.conf;
    if (!conf.templates || !conf.templates.listplaceholder) {
      return;
    }
    handlebars.run(this.domNode, {
      htemplate: conf.templates.listplaceholder,
      context: conf.context,
      entry: conf.entry,
    });
    if (!this.list.includeHead) {
      this.list.domNode.appendChild(this.domNode);
    }
  }
  show() {
    if (!this.list.includeHead) {
      this.list.getView().domNode.style.display = 'none';
      if (this.list.listHeadNode) {
        this.list.listHeadNode.style.display = 'none';
      }
    }
    this.domNode.style.display = 'block';
  }
  hide() {
    if (!this.list.includeHead) {
      this.list.getView().domNode.style.display = 'block';
      if (this.list.listHeadNode) {
        this.list.listHeadNode.style.display = 'block';
      }
    }
    this.domNode.style.display = 'none';
  }
}

// TODO: @scazan Why are we using this in this unbound function
const initExpandTitles = function () {
  this.expandTitle = this.list.conf.expandTooltip;
  this.unexpandTitle = this.list.conf.unexpandTooltip;
};

const CardRow = declare([_WidgetBase], {
  buildRendering() {
    this.domNode = this.srcNodeRef;
    this.domNode.classList.add('cardList-body');

    jquery('cardList-body').parent().addClass('cardRow'); // TODO: @scazan This is an error. Not fixing while refactoring.
    const conf = this.list.conf;
    if (!conf.templates || !conf.templates.rowhead) {
      return this.inherited(arguments);
    }
    handlebars.run(this.domNode, {
      htemplate: conf.templates.rowhead,
      context: this.entry.getContext().getId(),
      entry: this.entry.getId(),
    }, null, this.entry);

    return this.domNode;
  },
  isChecked() {
    return false;
  },
  updateCheckBox() {
  },
  updateLocaleStrings() {
  },
});


class ListRow extends EntryRow {
  postCreate() {
    this.showCol3 = false;
    this.initExpandTitles = initExpandTitles;
    this.rowNode.classList.add('col4hidden');
    this.inherited(arguments);
  }
  render() {
    const conf = this.list.conf;
    if (!conf.templates || !conf.templates.rowhead) {
      return this.inherited(arguments);
    }
    handlebars.run(this.nameNode, {
      htemplate: conf.templates.rowhead,
      context: this.entry.getContext().getId(),
      entry: this.entry.getId(),
    }, null, this.entry);

    return this.domNode;
  }
  getRenderNameHTML() {
    const name = this.getRenderName();
    const href = this.list.getRowClickLink(this);
    return href ? `<a href="${href}">${name}</a>` : name;
  }
}

export default declare([List, NLSMixin.Dijit], {
  includeHead: false,
  includeCreateButton: false,
  includeInfoButton: false,
  includeEditButton: false,
  includeRemoveButton: false,
  searchInList: true,
  nlsBundles: [{ escoList }, { escoErrors }],
  rowClickDefault: true,
  placeholderClass: PlaceHolder,
  contextId: null,
  rowClass: ListRow,

  //        rowClassPlain: EntryRow,
  //        rowClassExpand: MetadataExpandRow,
  conf: null,

  postCreate() {
    const data = this.conf;

    if (this.conf.layout === 'cards') {
      this.domNode.classList.add('cardLayout');
    }
    this.listViewClass = declare([ListView], {
      showEntryList(list) {
        dependencyList(list, data);
        this.inherited(arguments);
      },
      doneRenderingPage() {
        this.list.renderListHead();
        if (typeof data.scrollTop !== 'undefined') {
          jquery(document).scrollTop(parseInt(data.scrollTop, 10));
        }
      },
    });


    this.rowClickDefault = this.conf.click != null;
    if (this.conf.htemplate && !this.conf.templates) {
      try {
        this.conf.templates = handlebars.unGroup(this.conf.htemplate);
      } catch (e) {
        this.conf.error = e.toString();
        this.conf.errorCode = 3;
        this.conf.errorCause = this.conf.htemplate;
        error(this.domNode, this.conf);
        return;
      }
    }
    if (this.conf.templates && this.conf.templates.listhead) {
      this.listHeadNode = DOMUtil.create('div');
      this.domNode.appendChild(this.listHeadNode);
    }
    if (this.updateRowClass()) {
      this.registerRowAction({
        name: 'expand',
        button: 'link',
        iconType: 'fa',
        icon: 'chevron-down',
      });
    }
    this.inherited(arguments);
    if (this.conf.templates && this.conf.templates.listbody) {
      this.listbody = DOMUtil.create('div');
      this.domNode.appendChild(this.listbody);
      const bodyNode = handlebars.run(this.listbody, this.conf,
        this.conf.templates.listbody, null, true);
      bodyNode.appendChild(this.getView().domNode);
    }
  },
  renderListHead() {
    if (this.conf.templates && this.conf.templates.listhead) {
      const view = this.getView();
      handlebars.run(
        this.listHeadNode,
        Object.assign({
          resultsize: view.getResultSize(),
          currentpage: view.getCurrentPage(),
          pagecount: view.getPageCount(),
        }, this.conf),
        this.conf.templates.listhead, this.entry);
    }
  },
  updateRowClass() {
    if (this.conf.layout === 'cards') {
      this.rowClass = CardRow;
    }
    if (this.conf.templates != null && this.conf.templates.rowexpand) {
      this.rowClass = declare(TemplateExpandRow, { initExpandTitles });
    } else if (this.conf.rdformsid != null || this.conf.template != null) {
      this.rowClass = declare(MetadataExpandRow, { initExpandTitles });
    }

    return this.rowClass !== ListRow;
  },
  getRowClickLink(row) {
    if (this.conf.click) {
      const entry = row.entry;
      const prefix = config.hashParamsPrefix || 'esc_';
      return `${this.conf.click}#${prefix}entry=${entry.getId()}&${prefix}context=${entry.getContext().getId()}`;
    }

    return null;
  },
  localeChange() {
    this.updateLocaleStrings(this.NLSBundle0, this.NLSBundle1);
  },

  showStopSign() {
    return false;
  },

  search(paramsParams) {
    if (this.conf.relation && this.entry.getMetadata()
      .find(this.entry.getResourceURI(), this.conf.relation).length === 0) {
      this.listView.showEntryList(new ArrayList({ arr: [] }));
    } else {
      const qo = this.getSearchObject(paramsParams ? paramsParams.term : undefined);
      this.listView.showEntryList(qo.list());
    }
  },

  getSearchObject(term) {
    const es = registry.get('entrystore');
    const so = es.newSolrQuery();
    if (this.conf.relation) {
      const stmts = this.entry.getMetadata().find(this.entry.getResourceURI(), this.conf.relation);
      const rels = stmts.map(stmt => stmt.getValue());
      so.resource(rels);
    }

    if (this.conf.limit) {
      so.limit(this.conf.limit);
    }

    if (this.contextId) {
      so.context(this.contextId);
    } else if (this.conf.rowcontext === 'inherit' && this.conf.context) {
      so.context(this.conf.context);
    } else if (this.conf.rowcontext) {
      if (this.conf.rowcontext !== '') {
        so.context(this.conf.rowcontext);
      }
    }
    if (this.conf.relationinverse && this.entry) {
      so.uriProperty(this.conf.relationinverse, this.entry.getResourceURI());
    }

    if (this.conf.constraints) {
      constraints(so, this.conf.constraints);
    }

    if (this.block === 'searchList' && this.conf.headless) {
      filter.constraints(so);
    }
    if (this.conf.facets) {
      filter.facets(so);
    }

    if (this.conf.rdftype) {
      so.rdfType(this.conf.rdftype);
    }

    if (term != null && term.length > 0) {
      (Array.isArray(term) ? term : [term]).forEach((t) => {
        so.or({
          title: t,
          description: t,
          'tag.literal': t,
        });
      });
    }

    so.publicRead();

    return so;
  },
});
