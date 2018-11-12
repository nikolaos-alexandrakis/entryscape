import '@babel/polyfill';
import 'bloodhound-js'; // TODO @valentino typeahead alone seems to have issues, so import bloodhound seperately
import 'bootstrap';
import 'bootstrap-material-datetimepicker/css/bootstrap-material-datetimepicker.css';
import 'bootstrap-material-design';

import 'bootstrap-material-design/dist/css/bootstrap-material-design.css';
import 'bootstrap-material-design/dist/css/ripples.css';
import 'chartist/dist/chartist.min.css';

import 'jquery';
import 'popper.js';
import 'typeahead.js/dist/typeahead.jquery';
import '../assets/privacy_de.html';
import '../assets/privacy_en.html';
import '../assets/privacy_sv.html';
import initDefaults from './defaults';

initDefaults(); // init defaults/registry
