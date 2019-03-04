import m from 'mithril';
import File from '../File';

export default () => ({
  view(vnode) {
    const { files } = vnode.attrs;
    return (
      <div>
        { files.map(fileEntry => <File entry={fileEntry}/>)}
      </div>
    );
  }
});
