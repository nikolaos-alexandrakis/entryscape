import File from '../File';

/**
 * A list of files associated with a distribution
 *
 * @returns {object} A Mithril component
 */
export default () => ({
  view(vnode) {
    const { files, distribution, onUpdate } = vnode.attrs;
    return (
      <div>
        { files.map(fileEntry => <File
          key={fileEntry.getId()}
          entry={fileEntry}
          distribution={distribution}
          onUpdate={onUpdate}
        />)}
      </div>
    );
  }
});
