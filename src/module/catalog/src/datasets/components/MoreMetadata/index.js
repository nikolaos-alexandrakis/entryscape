import m from 'mithril';
import { engine } from 'rdforms';

export default (vnode) => {
  const { entry } = vnode.attrs;
  // const binding = engine.match(this.graph, this.resource, this.template);

  return {
    view(vnode) {
      const { metadata, isHidden } = vnode.attrs;
      const modificationDate = metadata.getModificationDate().toString();
      const hiddenClass = isHidden ? 'hidden' : '';

      return (
        <div class= {`metadata--more ${hiddenClass}`}>
        <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
        <p><span class="metadata__label">Last modified:</span>{modificationDate}</p>
        <p><span class="metadata__label">Publisher:</span> Mattias Palmer</p>
      </div>
    );
  },
};
};
