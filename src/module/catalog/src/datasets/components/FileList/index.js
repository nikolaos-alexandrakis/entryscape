import m from 'mithril';
import File from '../File';

export default () => ({
  view(vnode) {
    const { files, distribution, onUpdate } = vnode.attrs;
    return (
      <div>
        { files.map(fileEntry => <File
          entry={fileEntry}
          key={fileEntry.getId()}
          distribution={distribution}
          onUpdate={onUpdate}
          />)}
      </div>
    );
  }
});
