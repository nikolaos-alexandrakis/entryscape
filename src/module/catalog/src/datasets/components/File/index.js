import m from 'mithril';


export default () => {
  const getTitle = (entry) => {
    const metadata = entry.getMetadata();
    const subject = entry.getResourceURI();
    return metadata.findFirstValue(subject, 'dcterms:title');
  };

  return {
    view(vnode) {
      const { entry } = vnode.attrs;
      const title = 'someTitle';
      const format = 'someFormat';

      return (
        <div class="distribution__fileRow">
          <div class="distribution__format">
            <p class="distribution__title">{title}</p>
            <p class="file__format">
              <span class="file__format--short">{format}</span>
            </p>
          </div>
          <div>
            <div class="flex--sb">
              <p class="distributionFile__date">Jan 17</p>
              <button class="icons fa fa-cog"></button>
            </div>
            <div class={'file__dropdownMenu'}>
            </div>
          </div>
        </div>
      );
    },
  };
};
