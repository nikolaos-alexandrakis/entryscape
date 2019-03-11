import m from 'mithril';
import './index.scss';

export default (vnode) => ({
  view(vnode) {
    /**
     * @todo fix jsdoc
     * @type {{items: []}}
     */
    const { items, selected, onclick } = vnode.attrs;
    return (
      <div>
        <div class="stats-header">
          <div class="distribution__head__title">Title</div>
          <div class="flex"> 
          <div class="distribution__head__title">Format</div>
          <div class="distribution__head__title fa fa-download"></div>
          </div>

        </div>
        <div tabIndex="0" class="distribution__row flex--sb">
          <div class="distribution__format"><p class="distribution__title">Downloadable file</p><p
            class="file__format"><span class="file__format--short">application/octet-stream</span></p></div>
          <div class="flex--sb"><span class="distribution__format">XML</span></div>
          <div class="flex--sb"><span class="distribution__format">675</span></div>
        </div>
        <div tabIndex="0" class="distribution__row flex--sb">
          <div class="distribution__format"><p class="distribution__title">Downloadable file</p><p
            class="file__format"><span class="file__format--short">application/octet-stream</span></p></div>
          <div class="flex--sb"><p class="distribution__format">CSV</p></div>
          <div class="flex--sb"><p class="distribution__format">34</p></div>
        </div>
      </div>
    );
  },
});
