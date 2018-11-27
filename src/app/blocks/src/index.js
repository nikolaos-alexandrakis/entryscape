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
import 'blocks/bootstrap.less';
import 'font-awesome/css/font-awesome.min.css';
// import 'bootstrap-material-design/dist/css/bootstrap-material-design.css';
// import 'bootstrap-material-design/dist/css/ripples.css';
// import 'bootstrap-material-datetimepicker/css/bootstrap-material-datetimepicker.css';
// import 'rdforms/style.css';
// RDFORMS IMPORTS SHOULD BE HERE
import 'commons/list/list.css'; // escoList .panel
import 'commons/errors/errors.css';
import 'commons/query/typeahead.css';
import 'selectize/dist/css/selectize.bootstrap3.css';
import 'chartist/dist/chartist.min.css';
import 'blocks/style.css';

import initDefaults from './defaults';

export default initDefaults();

// rdforms: .cardgroup>.rdformsFields>.rdformsGroup
//
// NOT IN ORIGINAL:
// spa - .spaProgress, (not spaAsync) - SideDialog
// dtp - BMD
// ripple /commons/defaults = bmd all
// SHADOW - BMD
//
//
// PROPER ORDER:
// bootstrap
//
// fontawesome
//
// /* === Colors === */
// .rdformsLabel
//
// .input-group-btn > .form-control {
//
// .escoList .panel {
//
// .spaAsync {
//
// twitter typeahead
//
// selectize.bootstrap3.css
//
// ct-double-octave
//
// .entryscape .slick-prev
//
// .entryscape .rdformsPresenter .rdformsField {
//
