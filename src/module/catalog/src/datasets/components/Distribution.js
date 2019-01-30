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
        <div tabindex="0" class="distribution__row flex--sb">
          <div class="distribution__format flex--sb">
            <p class="distribution__title">{ title }</p>
            <p class="file__format">{ format } <span class="file__format--long">Common Separated Values</span></p>
          </div>
          <div class="icon--wrapper">
            <p class="distribution__date">Jan 17</p>
            { accessURI && <a href={accessURI}><button class="icons fa fa-external-link"></button></a> }
            { downloadURI && <a href={downloadURI}><button class="icons fa fa-download"></button></a> }
            <button class="icons fa fa-cog"></button>
          </div>
        </div>
      );
    },
  };
};
