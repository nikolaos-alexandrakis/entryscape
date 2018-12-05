import '@babel/polyfill';
import 'mithril';
import 'popper.js';
import 'bootstrap-material-design';
import 'typeahead.js/dist/typeahead.jquery';
import 'bloodhound-js'; // TODO @valentino typeahead alone seems to have issues, so import bloodhound seperately

import 'jquery';
import 'jquery-mousewheel';
import 'bootstrap';
import 'sizzle';
import 'blocks/bootstrap.less';
import 'font-awesome/css/font-awesome.min.css';
import 'commons/list/list.css'; // escoList .panel
import 'commons/errors/errors.css';
import 'commons/query/typeahead.css';
import 'selectize/dist/css/selectize.bootstrap3.css';
import 'chartist/dist/chartist.min.css';
import 'blocks/style.css';

import initDefaults from './defaults';

export default initDefaults();
