import DOMUtil from 'commons/util/htmlUtil';
import filter from 'blocks/utils/filter';
import params from 'blocks/boot/params';
import getEntry from 'blocks/utils/getEntry';
import getTextContent from 'blocks/utils/getTextContent';
import registry from 'commons/registry';

export default (node, data) => {
  filter.guard(node, data.if);

  getEntry(data, (entry) => {
    let pobj = {};
    const md = entry.getMetadata();
    node.innerHTML = '';
    if (data.property) {
      node.appendChild(DOMUtil.create(
        'a', {
          href: md.findFirstValue(entry.getResourceURI(), data.property),
          innerHTML: getTextContent(data, entry),
        }));
    } else {
      if (data.clickkey && data.clickvalue) {
        if (data.clickentry) {
          pobj.entry = entry.getId();
          pobj.context = entry.getContext().getId();
        }
        let mdValue;
        switch (data.clickvalue) {
          case 'resource':
            pobj[data.clickkey] = entry.getResourceURI();
            break;
          default:
            mdValue = md.findFirstValue(entry.getResourceURI(), data.clickvalue);
            if (mdValue && mdValue !== '') {
              pobj[data.clickkey] = mdValue;
            }
        }
      } else {
        pobj = { entry: entry.getId(), context: entry.getContext().getId() };
      }
      const clicks = registry.get('clicks');
      const click = (data.namedclick ? clicks[data.namedclick] : data.click) || '';
      node.appendChild(DOMUtil.create(
        'a', {
          href: params.getLink(click, pobj),
          innerHTML: getTextContent(data, entry),
        },
      ));
    }
  });
};
