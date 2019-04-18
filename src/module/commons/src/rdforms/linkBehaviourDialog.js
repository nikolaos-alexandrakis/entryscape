import typeIndex from 'commons/create/typeIndex';
import registry from 'commons/registry';
import jquery from 'jquery';
import { Presenter, system } from 'rdforms';
import DOMUtil from '../util/htmlUtil';


const linkBehaviour = {
  dialog: true,
};

const entrystoreutil = registry.get('entrystoreutil');
const choiceClick = (aroundNode, item, conf, entry) => {
  const presenter = new Presenter({}, DOMUtil.create('div'));
  const template = registry.get('itemstore').getItem(conf.template);
  presenter.show({
    resource: entry.getResourceURI(),
    graph: entry.getMetadata(),
    template,
  });
  let label = item.getLabel();
  if (label != null && label !== '') {
    label = label.charAt(0).toUpperCase() + label.slice(1);
  } else {
    label = '';
  }

  const popoverOptions = {
    html: true,
    container: jquery('#entryscape_dialogs')[0], // provided in defaults
    placement: 'auto',
    trigger: 'manual',
    template: '<div class="popover" role="tooltip">' +
      '<div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
    title: label,
    content: presenter.domNode,
  };
  const jn = jquery(aroundNode).popover(popoverOptions).attr('data-toggle', 'popover');
  setTimeout(() => {
    jn.popover('show');
  }, 30);
};

system.attachLinkBehaviour = (node, binding) => {
  const item = binding.getItem();
  if (item.getType() === 'choice') {
    const conf = typeIndex.getConfFromConstraints(item.getConstraints());
    if (conf) {
      node.onclick = (e) => {
        if (linkBehaviour.dialog) {
          e.preventDefault();
          entrystoreutil.getEntryByResourceURI(
            binding.getValue()).then(function () {
            choiceClick(node, item, conf, ...arguments);
          });
        }
      };
      return;
    }
  }
  node.setAttribute('target', '_blank');
};

export default linkBehaviour;
