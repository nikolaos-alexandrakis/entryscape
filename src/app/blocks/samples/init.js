var debug = document.location.search.indexOf('debug') > 0;
var path = debug ? '../../' : 'https://static.entryscape.com/';
var css = function (url) {
  document.write('<link rel="stylesheet" href="' + path + url + '"/>');
};

var js = function (url) {
  document.write('<script src="' + path + url + '"/><\/script>');
};

if (!debug) {
  document.write('<script src="https://static.entryscape.com/libs/jquery/dist/jquery.min.js" type="text/javascript"><\/script>');
  document.write('<script src="https://static.entryscape.com/libs/bootstrap/dist/js/bootstrap.min.js" type="text/javascript"><\/script>');
}

if (debug) {
  css('samples/style.css');
  js('app.js');
} else {
  css('blocks/0.11/style.css');
  js('blocks/0.11/all.js');
}
