import '@babel/polyfill';
import 'commons/theme/privacy_en.html';
import 'commons/theme/privacy_sv.html';
import 'commons/theme/privacy_de.html';
import 'mithril';
import 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap-material-design';
import 'typeahead.js/dist/typeahead.jquery';
import 'bloodhound-js'; // TODO @valentino typeahead alone seems to have issues, so import bloodhound seperately
import initDefaults from './defaults';
import registry from 'commons/registry';
import siteConfig from './config/site';

import 'bmd/dist/css/bootstrap-material-design.css';
import 'bmd/dist/css/ripples.css';
import 'bootstrap-material-datetimepicker/css/bootstrap-material-datetimepicker.css';
import 'chartist/dist/chartist.min.css';

initDefaults(); // init defaults/registry
