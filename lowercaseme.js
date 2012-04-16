var HTTP = require('http')
  , HTTPProxy = require('http-proxy')
  , URL = require('url')
  ;

HTTPProxy.createServer(function(request, response, next) {
  var original = response.writeHead;
  response.writeHead = function() {
    var args = Array.prototype.slice.call(arguments);
    if (args[0] == 403)
      args[0] = 404;
    original.apply(response, args);
  };
  next();
}, function(request, response, proxy) {
  var innerURL = request.url.substr(1);
  var parsedURL = URL.parse(innerURL);
  if (!parsedURL.hostname) {
    var body = 'Invalid URL ' + innerURL;
    response.writeHead(400, {
      'Content-Length': body.length,
      'Content-Type': 'text/plain'
    });
    response.write(body);
    response.end();
    return;
  }

  request.url = innerURL.toLowerCase();

  proxy.proxyRequest(request, response, {
    host: parsedURL.hostname,
    port: 80,
  });
}).listen(process.env.PORT);
