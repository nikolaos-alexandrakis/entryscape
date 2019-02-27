import m from 'mithril';

export default (vnode) => ({
  view(vnode) {
    const { metadata, isHidden } = vnode.attrs;
    const modificationDate = metadata.getModificationDate().toString();
    const hiddenClass = isHidden ? 'hidden' : '';

    const metadataTriples = metadata.getGraph().forEach((subject, predicate, object) => {
      // console.log([subject, predicate, object]);
    });

    // console.log(metadataTriples);

    return (
      <div class= {`metadata--more ${hiddenClass}`}>
        <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
        <p><span class="metadata__label">Last modified:</span>{modificationDate}</p>
        <p><span class="metadata__label">Publisher:</span> Mattias Palmer</p>
        <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
        <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
        <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
        <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
        <p><span class="metadata__label">Belongs to catalog:</span> Name of catalog</p>
      </div>
    );
  },
});
