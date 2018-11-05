import templateString from './ImageViewTemplate.html';
import escoContentview from 'commons/nls/escoContentview.nls';
import ContentView from './ContentView';
import declare from 'dojo/_base/declare';

export default declare([ContentView], {
  templateString,
  nlsBundles: [{escoContentview}],
  bid: 'escoImageView',
  includeMetadataPresentation: true,

  postCreate() {
    this.inherited(arguments);

    this.__imgContent.onload = () => {
      this.__imgContent.style.display = 'block';
      this.__message.style.display = 'none';
    };

    this.__imgContent.onerror = this.__imgContent.onabort = () => {
      this.__spinner.style.display = 'none';
      this.__messageText.innerHTML = this.NLSBundle0.imageCannotBeLoaded;
      this.__message.classList.remove('alert-info');
      this.__message.classList.add('alert-danger');
    };

    this.entry.refresh().then((entry) => {
      let imageURI;
      if (this.contentViewConf.property) {
        const md = entry.getMetadata();
        imageURI = md.findFirstValue(null, this.contentViewConf.property);
      }
      if (!imageURI) {
        const format = entry.getEntryInfo().getFormat();
        if (entry.isLink() || (format != null && format.indexOf('image/') === 0)) {
          imageURI = entry.getResourceURI();
        }
      }
      if (imageURI) {
        this.__spinner.style.display = '';
        this.__message.style.display = '';
        this.__message.classList.add('alert-info');
        this.__messageText.innerHTML = this.NLSBundle0.loadingImage;
        this.__imgContent.src = imageURI;
      } else {
        this.__message.style.display = '';
        this.__messageText.innerHTML = this.NLSBundle0.noImageProvided;
        this.__message.classList.remove('alert-info');
        this.__message.classList.add('alert-warning');
      }
    });
  },
});
