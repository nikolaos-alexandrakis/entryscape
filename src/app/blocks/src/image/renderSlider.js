import DOMUtil from 'commons/util/htmlUtil';
import getEntry from 'blocks/utils/getEntry';
import registry from 'commons/registry';
import jquery from 'jquery';

let depLoad;
let lblib;
const loadDependencies = async () => {
  if (!depLoad) {
    await import('slick-carousel' /* webpackChunkName: "slick-carousel" */);
    import('slick-carousel/slick/slick.css' /* webpackChunkName: "slick-carousel" */);
    import('slick-carousel/slick/slick-theme.css' /* webpackChunkName: "slick-carousel" */);
    import('lightbox2/dist/css/lightbox.min.css' /* webpackChunkName: "slick-carousel" */);
    lblib = await import('lightbox2' /* webpackChunkName: "slick-carousel" */);
  }
  return depLoad;
};

export default (node, data) => {
  loadDependencies().then(() => {
    const sliderContainer = DOMUtil.create('div', { class: 'slider-container' });
    node.appendChild(sliderContainer);
    getEntry(data, (entry) => {
      const es = registry.get('entrystore');
      const md = entry.getMetadata();
      const subject = entry.getResourceURI();
      const images = md.find(subject, data.property).map(stmt => stmt.getValue());

      if (images.length === 0 && data.fallback) {
        images.push(data.fallback);
        return;
      }

      const singleItem = DOMUtil.create('div', {
        class: 'single-item',
      });
      sliderContainer.appendChild(singleItem);

      const uri2caption = {};
      const render = () => {
        images.forEach((uri, index) => {
          const lconf = {
            class: 'lightbox-link',
            'data-lightbox': 'slider',
            href: uri,
          };
          if (uri2caption[uri]) {
            lconf['data-title'] = uri2caption[uri];
          }
          const wrapper = DOMUtil.create('div', lconf);
          singleItem.appendChild(wrapper);
          const lightboxNode = DOMUtil.create('a', lconf);
          wrapper.appendChild(lightboxNode);
          const sliderImage = DOMUtil.create('img', {
            class: 'slider-img',
            src: uri,
          });
          lightboxNode.appendChild(sliderImage);


          if (uri2caption[uri]) {
            const sliderCaptionEl = DOMUtil.create('div', {
              class: 'slider-caption',
              innerHTML: uri2caption[uri],
            });
            wrapper.appendChild(sliderCaptionEl);
          }

          if (index === 0) {
            sliderImage.onload = () => {
              jquery('.single-item').slick('setPosition');
            };
          }
        });
        jquery(document).ready(() => {
          jquery('.single-item').slick({
            dots: true,
            arrows: true,
            cssEase: 'linear',
            fade: true,
            adaptiveHeight: true,
          });

          lblib.option({
            alwaysShowNavOnTouchDevices: true,
          });
        });
      };

      if (images.length > 0) {
        if (data.caption) {
          es.newSolrQuery().resource(images).forEach((imageEntry) => {
            const ruri = imageEntry.getResourceURI();
            uri2caption[ruri] = imageEntry.getMetadata().findFirstValue(ruri, 'dc:rights');
          }).then(render);
        } else {
          render();
        }
      }
    });
  });
};
