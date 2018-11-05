import m from 'mithril';
import {renderingContext} from 'rdforms';

const create = (vnode) => {
  // Attributes interface
  const { editable, binding } = vnode.attrs;
  if (this.oldbinding && this.oldbinding !== binding) {
    this.oldbinding.setValue(null);
  }
  this.oldbinding = binding;
  renderingContext.getMessages((messages) => {
    vnode.dom.innerHTML = '';
    if (editable) {
      renderingContext.renderEditor(vnode.dom, binding, { view: { messages } });
    } else {
      renderingContext.renderPresenter(vnode.dom, binding, { view: { messages } });
    }
  });
};

const RDForm = {
  view() {
    return m('.escoRDForms', {});
  },
  oncreate: create,
  onupdate: create,
};

export { RDForm };
export default RDForm;
