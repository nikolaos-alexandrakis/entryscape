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

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bmd/dist/css/bootstrap-material-design.css';
import 'bmd/dist/css/ripples.css';
import 'bootstrap-material-datetimepicker/css/bootstrap-material-datetimepicker.css';
import 'font-awesome/css/font-awesome.css';
import "commons/module.css";
import "chartist/dist/chartist.min.css"; // TODO ?

import initDefaults from './defaults';

initDefaults(); // init defaults
