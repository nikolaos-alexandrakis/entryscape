import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import { Presenter } from 'rdforms';

export default (vnode) => {
  const { entry } = vnode.attrs;

  const attachMetadataRendered = () => {
    vnode.dom.innerHTML = '';
    const dataResultTemplate = registry.get('itemstore').getItem(config.catalog.datasetResultTemplateId);

    const presenterView = new Presenter({
      resource: entry.getResourceURI(),
      graph: entry.getMetadata(),
      template: dataResultTemplate,
    }, document.createElement('div'));

    return vnode.dom.appendChild(presenterView.domNode);
  };

  return {
    view(vnode) {
      const { isHidden } = vnode.attrs;
      const hiddenClass = isHidden ? 'hidden' : '';

      return (
        <div class={`metadata--more ${hiddenClass}`}>
        </div>
      );
    },
    onupdate(vnode) {
      // We are using an RDForms presenter here which creates it's own
      // DOM elements. So we wait until after render, then empty the component
      // and attach the RDForms Presenter data instead
      attachMetadataRendered();
    },
  };
};
