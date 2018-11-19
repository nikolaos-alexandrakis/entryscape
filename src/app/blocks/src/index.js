import '@babel/polyfill';
import 'mithril';
import 'popper.js';
import 'bootstrap-material-design';
import 'typeahead.js/dist/typeahead.jquery';
import 'bloodhound-js'; // TODO @valentino typeahead alone seems to have issues, so import bloodhound seperately

import 'jquery';
import 'jquery-mousewheel';
import 'bootstrap';
// import 'bootstrap/modal';
// import 'bootstrap/popover';
// import 'bootstrap/button';
// import 'bootstrap/dropdown';
// import 'bootstrap/tooltip';
import 'sizzle';
// import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
// import 'bootstrap-material-design/dist/css/bootstrap-material-design.css';
// import 'bootstrap-material-design/dist/css/ripples.css';
// import 'bootstrap-material-datetimepicker/css/bootstrap-material-datetimepicker.css';
import 'blocks/bootstrap.less';
import 'rdforms/style.css';
import 'commons/list/list.css';
import 'commons/errors/errors.css';
import 'commons/query/typeahead.css';
import 'selectize/dist/css/selectize.bootstrap3.css';
import 'chartist/dist/chartist.min.css';
import 'blocks/style.css';

import initDefaults from './defaults';

export default initDefaults();
