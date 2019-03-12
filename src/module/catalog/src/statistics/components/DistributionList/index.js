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
          <p class="distribution__head__title">Title</p>
          <div class="flex header--wrapper--right"> 
            <p class="distribution__head__title">Format</p>
            <p class="distribution__head__title fa fa-download"></p>
          </div>
        </div>

        <div tabIndex="0" class="stats__row flex--sb">
          <div class="row__title--wrapper">
            <p class="row__title">Dataset title</p>
            <p class="row__text">application/octet-stream</p>
          </div>
          <div class="flex--sb row--right--wrapper">
              <span class="row__text">XML</span>
              <span class="row__text">675</span>
          </div>
        </div>
      

   
    </div>   
    
    );
  },
});
