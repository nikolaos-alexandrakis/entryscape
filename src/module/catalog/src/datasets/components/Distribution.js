import m from 'mithril';

  const renderMetadata = () => {
    const md = this.entry.getMetadata();
    const subj = this.entry.getResourceURI();
    const title = md.findFirstValue(subj, ns.expand('dcterms:title'));
    const access = md.findFirstValue(subj, ns.expand('dcat:accessURL'));
    const downloadURI = md.findFirstValue(subj, ns.expand('dcat:downloadURL'));
    // clear format ,title,urlNode
    const empty = '';
    this.formatNode.innerHTML = empty;
    this.titleNode.innerHTML = empty;
    this.urlNode.innerHTML = empty;

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
        format = md.findFirstValue(subj, ns.expand(prop));
        return format != null;
      });
    }
    // If there is a nice format, show it
    if (format !== '' && format != null) {
      this.titleTd.classList.toggle('withFormat', format !== '' && format != null);
      this.formatNode.innerHTML = format;
    }

    if (title != null && title !== '') {
      // add title
      this.titleNode.innerHTML = title;
    } else {
      this.renderTitle();
    }
    if ((title == null) && (format == null)) {
      // add accessURL or download URL
      this.urlNode.innerHTML = access || downloadURI;
    }
    // this.titleNode, "innerHTML", title || desc || access);
    // domClass.toggle(this.titleTd, "withFormat", format !== "" && format != null);
    // domAttr.set(this.formatNode, "innerHTML", format || "");
    this.modDate = this.entry.getEntryInfo().getModificationDate();
    this.renderDate();
    this.clearDropdownMenu();
    this.renderDropdownMenu();
  };

export default () => {
  return {
    view: (vnode) => {
      const { distribution } = vnode.attrs;

      console.log(distribution);
      return (
        <div tabindex="0" class="distribution__row flex--sb">
          <div class="distribution__format flex--sb">
            <p class="distribution__title"> Downloadable file</p>
            <p class="file__format">CSV <span class="file__format--long">Common Separated Values</span></p>
          </div>
          <div class="icon--wrapper">
            <p class="distribution__date">Jan 17</p>
            <button class="icons fa fa-external-link"></button>
            <button class="icons fa fa-download"></button>
            <button class="icons fa fa-cog"></button>
          </div>
        </div>
      );
    },
  };
};
