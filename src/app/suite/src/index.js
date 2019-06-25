/* eslint-disable */

// NOTE! order of imports is important
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './publicPath';
import 'jquery';
import 'popper.js';
import 'bootstrap';
import 'bootstrap-material-design';
import 'typeahead.js/dist/typeahead.jquery';
import 'bloodhound-js'; // TODO @valentino typeahead alone seems to have issues, so import bloodhound seperately

import 'bootstrap-material-design/dist/css/bootstrap-material-design.css';
import 'bootstrap-material-datetimepicker/css/bootstrap-material-datetimepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'flag-icon-css/css/flag-icon.min.css';
import registry from 'commons/registry';
import initDefaults from './defaults';

initDefaults(); // init defaults

export default registry;
