import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import { Presenter } from 'rdforms';
import escoContentview from 'commons/nls/escoContentview.nls';
import ContentViewTabs from './ContentViewTabs';
import typeIndex from '../create/typeIndex';
import TitleDialog from '../dialog/TitleDialog';

export default declare([TitleDialog.ContentNLS], {
  templateString: `<div>
    <div data-dojo-attach-point="__contentviewer"></div>
    <div data-dojo-attach-point="__presenter"></div>
</div>`,
  nlsBundles: [{ escoContentview }],
  nlsHeaderTitle: 'contentViewDialogHeader',
  nlsFooterButtonLabel: 'contentViewDialogCloseLabel',

  show(entry, tmpl, entityConf) {
    let template = tmpl;
    let conf = entityConf;
    if (!conf) {
      conf = typeIndex.getConf(entry);
    }
    if (!template && conf && conf.template) {
      template = registry.get('itemstore').getItem(conf.template);
    }
    if (!template) {
      console.warn(`Cannot show uri "${uri}" since there is no suitable template`);
      return;
    }
    if (conf && conf.contentviewers) {
      this.useContentViewer(entry, conf);
    } else {
      this.usePresenter();
      let graph;
      if (entry.isReference()) {
        graph = entry.getCachedExternalMetadata();
      } else if (entry.isLinkReference()) {
        graph = entry.getCachedExternalMetadata().clone().addAll(entry.getMetadata());
      } else {
        graph = entry.getMetadata();
      }
      this.presenter.show({
        resource: entry.getResourceURI(),
        graph,
        template,
      });
    }
    this.dialog.show();
  },
  usePresenter() {
    if (!this.presenter) {
      this.presenter = new Presenter({ compact: true }, this.__presenter);
    }
    this.presenter.domNode.style.display = '';
    if (this.contentviewer) {
      this.contentviewer.domNode.style.display = 'none';
    }
  },
  useContentViewer(entry, conf) {
    if (this.contentviewer) {
      this.contentviewer.destroy();
    }

    const contentviewerDiv = document.createElement('div');
    this.__contentviewer.appendChild(contentviewerDiv);

    this.contentviewer = new ContentViewTabs({ entityConf: conf, entry },
      contentviewerDiv);
    if (this.presenter) {
      this.presenter.domNode.style.display = 'none';
    }
  },
});
