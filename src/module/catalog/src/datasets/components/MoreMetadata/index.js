import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import declare from 'dojo/_base/declare';
import { Presenter } from 'rdforms';
import { Graph } from 'rdfjson';

export default (vnode) => {
  const { entry } = vnode.attrs;

  const attachMetadataRendered = () => {
    vnode.dom.innerHTML = '';
    const dataResultTemplate = registry.get('itemstore').getItem(config.catalog.datasetTemplateId);
    // const graph = new Graph(entry.getMetadata().exportRDFJSON());
    const presenterContainer = document.createElement('div');
    presenterContainer.classList.add('mithrilMounted');

    const FilteredPresenter = declare(Presenter, {
      filterPredicates: ['http://www.w3.org/ns/locn#geometry'],
    });

    const presenterView = new FilteredPresenter({
      resource: entry.getResourceURI(),
      graph: entry.getMetadata(),
      template: dataResultTemplate,
    }, presenterContainer);

    return vnode.dom.appendChild(presenterView.domNode);
  };

  return {
    view(vnode) {
      const { isHidden } = vnode.attrs;
      const hiddenClass = isHidden ? 'hidden' : '';

      return (
        <div class={`metadata--more ${hiddenClass} mithrilMounted`}>
        </div>
      );
    },
    onupdate(vnode) {
      // @scazan: We are using an RDForms presenter here which creates it's own
      // DOM elements. So we wait until after render, then empty the component
      // and attach the RDForms Presenter data instead.
      // Due to m.mount being used in a component inside of RDForms, this causes an infinite rendering loop
      // since what is between that m.mount and the datasets components are re-rendered everytime and unmanaged.
      // attachMetadataRendered();
      //
    },
  };
};
