import DOMUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import config from 'blocks/config/config';
import { Presenter } from 'rdforms';
import EntryRow from 'commons/list/EntryRow';
import MetadataExpandRow from './MetadataExpandRow';
import getEntry from '../utils/getEntry';
import List from './List';

export default (node, data, items) => {
  if (data.rowhead || data.rowexpand || data.listempty || data.listhead || data.listbody || data.listplaceholder) {
    data.templates = data.templates || {};
    data.templates.rowhead = data.rowhead;
    data.templates.rowexpand = data.rowexpand;
    data.templates.listempty = data.listempty;
    data.templates.listhead = data.listhead;
    data.templates.listbody = data.listbody;
    data.templates.listplaceholder = data.listplaceholder;
  }

  if ((data.entry || config.urlParams.entry || config.econfig.entry) != null) {
    getEntry(data, (entry) => {
      if (entry.getMetadata().find(entry.getResourceURI(), data.property).length > 0) {
        data.headless = true;
        const sl = new List({
          conf: data,
          itemstore: items,
          entry,
        }, DOMUtil.create('div'));
        node.appendChild(sl.domNode);
        sl.show();
      } else {
        // TODO write "Nothing to show" somehow?
      }
    }, false);
  } else {
    const sl = new List({
      conf: data,
      itemstore: items,
      contextId: data.context || config.urlParams.context || config.econfig.context,
    }, DOMUtil.create('div'));
    node.appendChild(sl);
    sl.show();
  }
};
