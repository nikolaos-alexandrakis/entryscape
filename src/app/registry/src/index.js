import '@babel/polyfill';
import '../assets/privacy_en.html';
import '../assets/privacy_sv.html';
import '../assets/privacy_de.html';

import 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap-material-design';
import 'typeahead.js/dist/typeahead.jquery';
import 'bloodhound-js'; // TODO @valentino typeahead alone seems to have issues, so import bloodhound seperately
import initDefaults from './defaults';
import registry from 'commons/registry';
import siteConfig from './config/site';

import 'bootstrap-material-design/dist/css/bootstrap-material-design.css';
import 'bootstrap-material-design/dist/css/ripples.css';
import 'bootstrap-material-datetimepicker/css/bootstrap-material-datetimepicker.css';
import 'chartist/dist/chartist.min.css';

initDefaults(); // init defaults/registry
