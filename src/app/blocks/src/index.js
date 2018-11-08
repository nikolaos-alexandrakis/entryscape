import '@babel/polyfill';
import 'mithril';
import 'popper.js';
import 'bmd';
import 'typeahead.js/dist/typeahead.jquery';
import 'bloodhound-js'; // TODO @valentino typeahead alone seems to have issues, so import bloodhound seperately
import initDefaults from './defaults';

// import 'bmd/dist/css/bootstrap-material-design.css';
// import 'bmd/dist/css/ripples.css';
// import 'bootstrap-material-datetimepicker/css/bootstrap-material-datetimepicker.css';
// import 'chartist/dist/chartist.min.css'; // TODO ?


import 'jquery';
import 'jquery-mousewheel';
import 'bootstrap';
// import 'bootstrap/modal';
// import 'bootstrap/popover';
// import 'bootstrap/button';
// import 'bootstrap/dropdown';
// import 'bootstrap/tooltip';
import 'sizzle';

import bootBlocks from './boot/block';

initDefaults();
bootBlocks();
