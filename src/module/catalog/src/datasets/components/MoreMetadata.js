import m from 'mithril';

export default (vnode) => ({
  view(vnode) {
    const {metadata} = vnode.attrs;
    const modificationDate = metadata.getModificationDate().toString();
    return (
      <div class="metadata--more">
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
