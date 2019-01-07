import Alert from 'commons/components/common/alert/Alert';
import Button from 'commons/components/common/button/Button';
import Row from 'commons/components/common/grid/Row';
import EntryType from 'commons/create/EntryType';
import TaskProgress from 'commons/progresstask/components/TaskProgress';
import ProgressDialog from 'commons/progresstask/ProgressDialog';
import registry from 'commons/registry';
import { readFileAsText } from 'commons/util/fileUtil';
import htmlUtil from 'commons/util/htmlUtil';
import config from 'config';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { i18n, NLSMixin } from 'esi18n';
import m from 'mithril';
import { converters, Graph, utils } from 'rdfjson';
import { promiseUtil } from 'store';
import esteImport from 'terms/nls/esteImport.nls';
import template from './ImportTerminologyTemplate.html';

const createContext = (paramsArg) => {
  const params = paramsArg;
  const es = registry.get('entrystore');
  return es.createGroupAndContext().then((groupEntry) => {
    params.groupEntry = groupEntry;
    params.homeContextId = groupEntry.getResource(true).getHomeContext();
    if (!registry.get('hasAdminRights')) {
      params.list.entryList.setGroupIdForContext(params.homeContextId, groupEntry.getId());
    }

    // Fix new context, both type and correct ACL.
    return es.getEntry(es.getEntryURI('_contexts', params.homeContextId))
      .then((ctxEntry) => {
        const hcEntryInfo = ctxEntry.getEntryInfo();
        hcEntryInfo.getGraph().add(ctxEntry.getResourceURI(),
          'rdf:type', 'esterms:TerminologyContext');
        /* TODO remove when entrystore is changed so groups have
         read access to homecontext metadata by default.
         Start fix with missing metadata rights on context for group */
        const acl = hcEntryInfo.getACL(true);
        acl.mread.push(groupEntry.getId());
        hcEntryInfo.setACL(acl);
        // End fix
        return hcEntryInfo.commit().then(() => params);
      });
  });
};

const fixURIs = (paramsArg) => {
  const params = paramsArg;
  const graph = params.graph;
  const conceptSchemeURI = params.conceptSchemeURI;
  if (config.terms == null || config.terms.replace == null) {
    return params;
  }
  const es = registry.get('entrystore');
  let counter = 0;
  let onlyCounter = false;
  const ids = {};
  let conceptSchemeURIReplaced = false;
  params.newURIs = [];
  params.anythingReplaced = false;
  const replace = config.terms.replace;

  let cstmts;
  if (replace.matchPredicate) {
    cstmts = graph.find(null, replace.matchPredicate);
    if (replace.matchDatatype) {
      cstmts = cstmts.filter(stmt => stmt.getDatatype() === replace.matchDatatype);
    }
  }
  if (cstmts.length === 0 && (replace.URIRegexp || replace.allURIs)) {
    cstmts = graph.find(null, 'rdf:type', 'skos:Concept');
    onlyCounter = true;
    if (replace.URIRegexp) {
      cstmts = cstmts.filter(cstmts, stmt => replace.URIRegexp.exec(stmt.getSubject()));
    }
  }

  const fromTo = {};
  cstmts.forEach(cstmts, (cstmt) => {
    const s = cstmt.getSubject();
    let id;
    if (onlyCounter) {
      counter += 1;
      id = `${id}concept_${counter}`;
    } else {
      id = cstmt.getValue();
      if (ids[id]) {
        counter += 1;
        id = `${id}_${counter}`;
      }
    }
    ids[id] = true;
    const nuri = es.getResourceURI(params.homeContextId, id);
    graph.replaceURI(s, nuri);
    fromTo[s] = nuri;
    params.newURIs[nuri] = { old: s, newId: id };
    params.anythingReplaced = true;
    if (conceptSchemeURI === s) {
      conceptSchemeURIReplaced = true;
      params.conceptSchemeURI = nuri;
    }
  });
  if (!conceptSchemeURIReplaced) {
    if (replace.URIRegexp &&
      (replace.URIRegexp.exec(conceptSchemeURI) !== null || replace.allURIs)) {
      const newCSURI = es.getResourceURI(params.homeContextId, 'terminology');
      graph.replaceURI(conceptSchemeURI, newCSURI);
      params.newURIs[newCSURI] = { old: params.conceptSchemeURI, newId: 'terminology' };
      fromTo[params.conceptSchemeURI] = newCSURI;
      params.conceptSchemeURI = newCSURI;
    }
  }

  return params;
};

const fixSymmetry = (paramsArg) => {
  const params = paramsArg;
  const graph = params.graph;
  const conceptSchemeURI = graph.find(null, 'rdf:type', 'skos:ConceptScheme')[0].getSubject();

  const broader = {};
  const topConcepts = graph.find(conceptSchemeURI, 'skos:hasTopConcept') || [];
  topConcepts.forEach((stmt) => {
    broader[stmt.getValue()] = conceptSchemeURI;
    graph.add(stmt.getValue(), 'skos:topConceptOf', stmt.getSubject());
  });
  const cstmts = graph.find(null, 'rdf:type', 'skos:Concept') || [];
  cstmts.forEach((cstmt) => {
    const conceptURI = cstmt.getSubject();
    graph.add(conceptURI, 'skos:inScheme', conceptSchemeURI);
    const broderConcepts = graph.find(conceptURI, 'skos:broader') || [];
    broderConcepts.forEach((stmt) => {
      broader[conceptURI] = stmt.getValue();
      graph.add(stmt.getValue(), 'skos:narrower', conceptURI);
    });
    const topConceptOf = graph.find(conceptURI, 'skos:topConceptOf') || [];
    topConceptOf.forEach((stmt) => {
      broader[conceptURI] = stmt.getValue();
      graph.add(stmt.getValue(), 'skos:hasTopConcept', stmt.getSubject());
    });
  });
  const counter = Object.keys(broader).length;

  if (counter < cstmts.length && (cstmts.length - counter) < 500) {
    cstmts.forEach((cstmt) => {
      const conceptURI = cstmt.getSubject();
      if (!broader[conceptURI]) {
        graph.add(conceptURI, 'skos:topConceptOf', conceptSchemeURI);
        graph.add(conceptSchemeURI, 'skos:hasTopConcept', conceptURI);
      }
    });
  }
  return params;
};

const importConceptScheme = (paramsArgs) => {
  const params = paramsArgs;
  const graph = params.graph;
  const conceptSchemeURI = params.conceptSchemeURI;
  const store = registry.get('entrystore');
  const context = store.getContextById(params.homeContextId);
  let pe;

  if (params.anythingReplaced && params.newURIs[conceptSchemeURI]) {
    pe = context.newNamedEntry(params.newURIs[conceptSchemeURI].newId);
  } else {
    pe = context.newLink(conceptSchemeURI);
  }
  pe.setMetadata(utils.extract(graph, new Graph(), conceptSchemeURI));

  return pe.commit().then((csEntry) => {
    params.csEntry = csEntry;
    return params;
  });
};

const importConcepts = (params) => {
  const context = params.csEntry.getContext();
  const stmts = params.graph.find(null, 'rdf:type', 'skos:Concept');
  const importDialog = params.importTerminology;

  const totalConcepts = stmts.length;
  let importedConcepts = 0;

  // ignore spinning wheels for various actions
  const async = registry.get('asynchandler');
  async.addIgnore('createEntry', true, true);
  async.addIgnore('getEntry', true, true);
  async.addIgnore('refresh', true, true);
  async.addIgnore('commitEntryInfo', true, true);

  return promiseUtil.forEach(stmts, (stmt) => {
    const uri = stmt.getSubject();
    let pe;
    if (params.anythingReplaced && params.newURIs[uri]) {
      pe = context.newNamedEntry(params.newURIs[uri].newId);
    } else {
      pe = context.newLink(uri);
    }

    pe.setMetadata(utils.extract(params.graph, new Graph(), uri));
    // update UI progress with number of concepts imported
    return pe.commit().then(() => {
      importedConcepts += 1;
      const message = importDialog.getConceptsImportedMessage(importedConcepts, totalConcepts);
      importDialog.tasks.import.message = message;
      importDialog.updateProgressDialog(importDialog.tasks);
    });
  }).then(() => params);
};

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  templateString: template,
  bid: 'esteImport',
  maxWidth: 800,
  nlsBundles: [{ esteImport }],
  initialTasksState: {
    upload: {
      id: 'echo',
      name: '',
      nlsTaskName: 'uploadTask', // nlsString
      width: '33%', // max width / nr of tasks,
      order: 1,
      status: '', // started, progress, done
      message: '',
    },
    analysis: {
      id: 'analysis',
      name: '',
      nlsTaskName: 'analysisTask', // nlsString
      width: '33%', // max width / nr of tasks,
      order: 2,
      status: '',
      message: '',
    },
    import: {
      id: 'import',
      name: '',
      nlsTaskName: 'importTask', // nlsString
      width: '34%', // max width / nr of tasks,
      order: 3,
      status: '',
      message: '',
    },
  },
  errorTask: -1,
  nlsHeaderTitle: 'replaceFileHeader',
  nlsFooterButtonLabel: 'replaceFileFooterButton',
  postCreate() {
    // Add margin-left 1% somehow to be inline with rdforms.
    const valueChange = (value) => {
      if (this.isFile) {
        this.dialog.unlockFooterButton();
        return;
      }
      if (value != null && (value !== this.oldValue)) {
        this.dialog.unlockFooterButton();
      } else {
        this.dialog.lockFooterButton();
      }
    };
    this.fileOrLink = new EntryType({
      valueChange,
    }, htmlUtil.create('div', null, this.__fileOrLink, true));
    this.fileOrLink.show(true, true, false);
    this.inherited(arguments);
    this.progressDialog = new ProgressDialog();
    // this.localePromise.then(() => (this.tasks = lang.clone(this.initialTasksState)));
  },
  localeChange() {
    this.inherited(arguments);
    const bundle = this.NLSBundles.esteImport;
    if (bundle) {
      this.initialTasksState.upload.name = bundle[this.initialTasksState.upload.nlsTaskName];
      this.initialTasksState.analysis.name = bundle[this.initialTasksState.analysis.nlsTaskName];
      this.initialTasksState.import.name = bundle[this.initialTasksState.import.nlsTaskName];
      this.tasks = this.initialTasksState;
    }
  },
  init() {
    this.fileOrLink.show(true, true, false);
    this._clear();
  },
  footerButtonAction() {
    const fileUpload = this.fileOrLink.isFile();
    return new Promise(resolve => resolve(this.process(fileUpload)));
  },
  process(fileUpload = false) {
    // show up the modal and initialize the UI with tasks
    this.progressDialog.show();
    this.updateProgressDialog(this.tasks);

    const dataPromise = fileUpload ? this.fileUpload() : this.linkUpload();
    return dataPromise
      .then(this.analyseData.bind(this))
      .then(this.importData.bind(this))
      .then((params) => {
        this.showFooterResult();
        return params;
      }).then(this.addTerminologyToList.bind(this));
  },
  /**
   * @return {Promise} the data in the file
   */
  fileUpload() {
    this.tasks.upload.status = 'progress';
    this.updateProgressDialog(this.tasks);
    const asyncHandler = registry.get('asynchandler');
    asyncHandler.addIgnore('echoFile', true, true);
    /** @type HTMLInputElement */
    const inputElement = this.fileOrLink.getFileInputElement();
    /** @type File */
    const file = inputElement.files.item(0);

    // read file in browser and try to parse RDF
    return readFileAsText(file).then((data) => {
      // update the UI
      this.tasks.upload.status = 'done';
      this.updateProgressDialog(this.tasks);

      return data;
    }, (err) => {
      this.errorTask = 'upload';
      throw Error(err.message);
    });
  },
  /**
   * @return {Promise} the data in the link
   */
  linkUpload() {
    const url = this.fileOrLink.getValue();
    const async = registry.get('asynchandler');
    async.addIgnore('loadViaProxy', true, true);
    async.addIgnore('loadViaProxy', async.codes.GENERIC_PROBLEM, true);
    return registry.get('entrystore').loadViaProxy(url, 'application/rdf+xml')
      .then((data) => {
        // update the UI
        this.tasks.upload.name = 'Download File'; // nls change
        this.tasks.upload.status = 'done';
        this.updateProgressDialog(this.tasks);

        return data;
      }, (err) => {
        const bundle = this.NLSBundles.esteImport;
        let message;
        if (err.response.status === 504) {
          message = bundle.noResponseFromLink;
        } else {
          message = bundle.loadFromLinkProblem + err;
        }
        this.errorTask = 'upload';
        throw Error(message);
      });
  },
  _clear() {
    this.tasks = this.initialTasksState;
    this.errorTask = -1;
    this.dialog.lockFooterButton();
  },
  /**
   * Get a graph from data and check for a concept scheme uri
   *
   * @param data
   * @return {{graph: (*|graph), conceptSchemeURI: (*|String)}}
   */
  analyseData(data) {
    this.tasks.analysis.status = 'progress';
    this.updateProgressDialog(this.tasks);

    let conceptSchemeURI;
    let graph;
    try {
      graph = this.convertDataToGraph(data);
      conceptSchemeURI = this.getConceptSchemeURI(graph);
    } catch (err) {
      this.errorTask = 'analysis';
      throw Error(err.message);
    }

    this.tasks.analysis.status = 'done';
    this.updateProgressDialog(this.tasks);

    return { graph, conceptSchemeURI };
  },
  importData(info) {
    this.tasks.import.status = 'progress';
    this.updateProgressDialog(this.tasks);

    const { graph, conceptSchemeURI } = info;
    return createContext({
      importTerminology: this,
      list: this.list,
      graph,
      conceptSchemeURI,
    }).then(fixURIs)
      .then(fixSymmetry)
      .then(importConceptScheme)
      .then(importConcepts)
      .then((params) => {
        this.tasks.import.status = 'done';
        this.updateProgressDialog(this.tasks);
        return params;
      }, (err) => {
        this.errorTask = 'import';
        throw Error(err.message);
      });
  },
  /**
   * Check if graph has exactly one skos:ConceptScheme and returns its statement. Otherwise
   * throw an error.
   *
   * @param graph
   * @return {String}
   */
  getConceptSchemeURI(graph) {
    const bundle = this.NLSBundles.esteImport;
    const stmts = graph.find(null, 'rdf:type', 'skos:ConceptScheme');
    if (stmts.length !== 1) {
      throw Error(bundle.noConceptSchemeInSKOS);
    }
    return stmts[0].getSubject();
  },
  /**
   * Convert data to a graph or throw an error
   *
   * @param data
   * @return graph
   */
  convertDataToGraph(data) {
    const bundle = this.NLSBundles.esteImport;
    const report = converters.detect(data);
    const graph = report.graph;
    if (graph) {
      return graph;
    }

    this.dialog.lockFooterButton();
    throw Error(bundle.noSKOS + report.error);
  },
  addTerminologyToList(params) {
    const userEntry = registry.get('userEntry');
    userEntry.setRefreshNeeded();
    userEntry.refresh();
    this._clear();
    const row = params.list.getView().addRowForEntry(params.csEntry);
    params.list.rowMetadataUpdated(row);
  },
  /**
   * This is the main function to update the progress dialog
   *
   * @param tasks
   * @param updateFooter Shows a result alert at the end of the modal
   * @param errorMessage
   */
  updateProgressDialog(tasks, updateFooter = false, errorMessage = null) {
    const modalBody = this.progressDialog.getModalBody();

    const getObjectValues = x => Object.keys(x).reduce((y, z) => y.push(x[z]) && y, []);
    m.render(modalBody, m(TaskProgress, { tasks: getObjectValues(tasks) }));

    if (updateFooter) {
      this.showFooterResult(errorMessage);
    }
  },
  showFooterResult(message = null) {
    const modalFooter = this.progressDialog.getModalFooter();
    const onclick = this.progressDialog.hide.bind(this.progressDialog);
    const bundle = this.NLSBundles.esteImport;

    m.render(modalFooter, m(Row, {
      classNames: ['spaSideDialogFooter'],
      columns: [{
        size: 12,
        value: [
          m(Button, {
            element: 'button',
            // type: message ? 'default' : 'primary',
            classNames: ['pull-right', 'col-md-2'],
            text: message ? bundle.nlsProgressCancel : bundle.nlsProgressDone,
            onclick,
          }),
          m(Alert, {
            element: 'span',
            type: message ? 'danger' : 'success',
            classNames: ['pull-left', 'col-md-8'],
            text: message || bundle.nlsProgressSuccess, // nls
            children: null,
          })],
      }],
    }));
  },
  footerButtonClick() {
    if (this.lock) {
      return undefined;
    }
    const dialog = this.dialog;
    const res = this.footerButtonAction();

    if (res && typeof res.then === 'function') {
      dialog.hide();
      return res.then(null, (err) => {
        if (err instanceof Error) {
          this.showErrorMessage(res, this.errorTask);
          throw res;
        } else if (typeof err === 'object' && err.message) {
          this.showErrorMessage(err.message, this.errorTask);
          throw err.message;
        }
      });
    }
    this.showErrorMessage(res, 'import');// check here
    return res;
  },
  showErrorMessage(text, taskIdx) {
    this.tasks[taskIdx].status = 'failed';
    this.updateProgressDialog(this.tasks, true, text);
  },
  getConceptsImportedMessage(importedConcepts, totalConcepts) {
    return i18n.renderNLSTemplate(this.NLSBundles.esteImport.nlsNumberOfConceptsImported, {
      importedConcepts,
      totalConcepts,
    });
  },
});
