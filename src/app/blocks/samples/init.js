var debug = document.location.search.indexOf('debug') > 0;
var path = debug ? '../../' : 'https://static.entryscape.com/';

var js = function (url) {
  document.write('<script src="' + path + url + '"/><\/script>');
};

if (debug) {
  js('app.js');
} else {
  js('blocks/0.14/app.js');
}
