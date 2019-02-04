import m from 'mithril';
import registry from 'commons/registry';
import config from 'config';
import { engine, utils as rdformsUtils } from 'rdforms';

export default () => {
  const namespaces = registry.get('namespaces');
  const getMetadata = (entry) => {
    const md = entry.getMetadata();
    const subj = entry.getResourceURI();
    const title = md.findFirstValue(subj, namespaces.expand('dcterms:title'));
    const accessURI = md.findFirstValue(subj, namespaces.expand('dcat:accessURL'));
    const downloadURI = md.findFirstValue(subj, namespaces.expand('dcat:downloadURL'));

    let format;
    // Check for template driven format
    const formatTemplate = config.catalog.formatTemplateId ?
      registry.get('itemstore').getItem(config.catalog.formatTemplateId) : undefined;
    if (formatTemplate) {
      format = rdformsUtils.findFirstValue(engine, md, subj, formatTemplate);
    }
    // Alternatively check for pure value via array of properties
    if (!format && config.catalog.formatProp) {
      const formatPropArr = typeof config.catalog.formatProp === 'string' ? [config.catalog.formatProp] :
        config.catalog.formatProp;
      formatPropArr.find((prop) => {
        format = md.findFirstValue(subj, namespaces.expand(prop));
        return format != null;
      });
    }
    // If there is a nice format, show it
    if (format !== '' && format != null) {
      // this.titleTd.classList.toggle('withFormat', format !== '' && format != null);
      // this.formatNode.innerHTML = format;
    }

    if (title != null && title !== '') {
      // add title
      // this.titleNode.innerHTML = title;
    } else {
      // this.renderTitle();
    }
    if ((title == null) && (format == null)) {
      // add accessURI or download URL
      // this.urlNode.innerHTML = accessURI || downloadURI;
    }
    const modificationDate = entry.getEntryInfo().getModificationDate();
    // this.renderDate();
    // this.clearDropdownMenu();
    // this.renderDropdownMenu();

    return {
      title,
      format,
      modificationDate,
      accessURI,
      downloadURI
    };
  };
  return {
    view: (vnode) => {
      const { distribution } = vnode.attrs;
      const { title, format, modificationDate, accessURI, downloadURI } = getMetadata(distribution);

      return (
      <div>
        <div tabindex="0" class="distribution__row flex--sb">
          <div class="distribution__format flex--sb">
            <p class="distribution__title">{ title }</p>
            <p class="file__format">{ format } <span class="file__format--long">Common Separated Values</span></p>
            <p class="distribution__date">Jan 17</p>
          </div>
          
        </div>
        <div class="distribution__expand">
          <div class="menu--wrapper">
              <div class=" icon--wrapper distribution--file">
              <a><button class=" btn--distribution fa fa-fw fa-pencil"><span>Edit</span></button></a>
              { downloadURI && <a href={downloadURI}><button class=" btn--distribution fa fa-fw fa-download"><span>Download</span></button></a> }
              <a><button class=" btn--distribution fa fa-fw fa-link"><span>Activate API</span></button></a>
              <a><button class=" btn--distribution fa fa-fw fa-info-circle"><span>API information</span></button></a>
              <a><button class=" btn--distribution fa fa-fw fa-retweet"><span>Refresh API</span></button></a>
              <a><button class=" btn--distribution fa fa-fw fa-exchange"><span>Replace file</span></button></a>
              <a><button class=" btn--distribution fa fa-fw fa-file"><span>Add file</span></button></a>
              <a><button class=" btn--distribution fa fa-fw fa-bookmark"><span>Revisions</span></button></a>
              <a><button class=" btn--distribution fa fa-fw fa-remove"><span>Remove distribution</span></button></a>
              </div>

              <div class="icon--wrapper distribution--link">
              <a><button class=" btn--distribution fa fa-fw fa-pencil"><span>Edit</span></button></a>
              { accessURI && <a href={accessURI}><button class="btn--distribution fa fa-fw fa-info-circle"><span>Web adress of access point</span></button></a> }
              <a><button class=" btn--distribution fa fa-fw fa-download"><span>Download</span></button></a>
              <a><button class=" btn--distribution fa fa-fw fa-bookmark"><span>Revisions</span></button></a>
              <a><button class=" btn--distribution fa fa-fw fa-remove"><span>Remove distribution</span></button></a>
              </div>
          </div>
          <div>
            
          </div>
        </div>
      </div>
      );
    },
  };
};
