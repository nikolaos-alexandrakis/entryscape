import registry from 'commons/registry';
import EntryType from 'commons/create/EntryType';
import TitleDialog from 'commons/dialog/TitleDialog';
import { converters, utils } from 'rdfjson';
import { i18n } from 'esi18n';
import eswoImportDialog from 'workbench/nls/eswoImportDialog.nls';
import declare from 'dojo/_base/declare';
import template from './ImportDialogTemplate.html';

export default declare([TitleDialog.ContentNLS], {
  bid: 'eswoImportDialog',
  maxWidth: 800,
  templateString: template,
  nlsBundles: [{ eswoImportDialog }],
  nlsHeaderTitle: 'importRDFHeader',
  nlsFooterButtonLabel: 'importRDFButton',
  __entryTypeNode: null,
  __importInformation: null,

  postCreate() {
    this.inherited(arguments);
    const valueChange = val => (val != null ? this.dialog.unlockFooterButton() : this.dialog.lockFooterButton());
    this.entryType = new EntryType({
      valueChange,
    }, this.__entryTypeNode);
  },
  open() {
    this.entryType.show(true, true, false);
    this.inherited(arguments);
    this.dialog.show();
  },
  localeChange() {
    this.inherited(arguments);
    let rt = this.list.benchTypeConf.rdfType;
    rt = Array.isArray(rt) ? rt[0] : rt;
    const info = i18n.renderNLSTemplate(this.NLSLocalized.eswoImportDialog.importInformation, {
      entityType: this.list.getName(),
      rdfType: rt,
    });
    this.__importInformation.innerHTML = info;
  },
  footerButtonAction() {
    const val = this.entryType.getValue();
    const f = this.importData.bind(this);

    if (this.entryType.isFile()) {
      const inp = this.entryType.getFileInputElement();
      return registry.get('entrystore').echoFile(inp, 'text').then(f);
    }
    return registry.get('entrystore').loadViaProxy(val, 'application/rdf+xml').then(f);
  },
  importData(data) {
    const report = converters.detect(data);
    if (!report.error) {
      const entityURIs = this.detectEntities(report.graph);
      return Promise.all((entityURIs || []).map(this.importEntity.bind(this, report.graph)));
    }
    throw report.error;
  },
  detectEntities(graph) {
    let rt = this.list.benchTypeConf.rdfType;
    rt = Array.isArray(rt) ? rt[0] : rt;
    return graph.find(null, 'rdf:type', rt).map(stmt => stmt.getSubject());
  },
  importEntity(graph, entityURI) {
    const np = registry.get('context').newLink(entityURI);
    const ngraph = utils.extract(graph, entityURI);
    this.mapEntityMetadata(ngraph, entityURI);
    np.setMetadata(ngraph);
    return np.commit().then((entry) => {
      this.list.addRowForEntry(entry);
    });
  },
  mapEntityMetadata(graph) {
    const map = this.list.benchTypeConf.importMap;
    if (map) {
      Object.keys(map).forEach((key) => {
        const stmts = graph.find(null, key, null);
        stmts.forEach((stmt) => {
          const o = stmt.getObject();
          delete o._statement;
          const oc = { ...o };
          o._statement = stmt;

          graph.add(stmt.getSubject(), map[key], oc);
        });
      });
    }
  },
});
