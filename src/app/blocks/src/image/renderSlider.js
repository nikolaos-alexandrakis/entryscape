import DOMUtil from 'commons/util/htmlUtil';
import getEntry from 'blocks/utils/getEntry';
import getTextContent from 'blocks/utils/getTextContent';
import registry from 'commons/registry';
import jquery from 'jquery';

  let depLoad;
  let lblib;
  const loadDependencies = () => {
    if (!depLoad) {
      const slickPath = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/';
      const lightboxPath = 'https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.10.0/';
      jquery('<link/>', { rel: 'stylesheet', type: 'text/css', href: `${slickPath}slick.css` }).appendTo('head');
      jquery('<link/>', { rel: 'stylesheet', type: 'text/css', href: `${slickPath}slick-theme.css` }).appendTo('head');
      jquery('<link/>', { rel: 'stylesheet', type: 'text/css', href: `${lightboxPath}css/lightbox.css` }).appendTo('head');
      depLoad = new Promise((resolve) => {
        require([`${slickPath}slick.min.js`, `${lightboxPath}js/lightbox.js`], (slick, lightbox) => {
          lblib = lightbox;
          resolve();
        });
      });
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
        }

        if (images.length === 1) {
          DOMUtil.create('img', {
            class: 'slider-img',
            src: images[0],
          });
          sliderContainer.appendChild('img');
          return;
        }

        const singleItem = DOMUtil.create('div',{
          class: 'single-item',
        })
        sliderContainer.appendChild(singleItem);

        const uri2caption = {};
        const render = () => {
          images.forEach((uri, index) => {
            const lconf = {
              class: 'lightbox-link',
              'data-lightbox': 'slider',
//            'data-title': null,//'placeholder for photographer name',
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
              DOMUtil.create('div', {
                class: 'slider-caption',
                innerHTML: uri2caption[uri],
              });
              wrapper.appendChild('div');
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
