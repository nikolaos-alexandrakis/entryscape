import m from 'mithril';
import {
  getTitle,
} from 'catalog/datasets/utils/distributionUtil';


export default () => ({
  view(vnode) {
    const { entry } = vnode.attrs;
    const title = getTitle(entry);
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
});
