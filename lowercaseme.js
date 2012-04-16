var HTTP = require('http')
  , HTTPProxy = require('http-proxy')
  , URL = require('url')
  ;

var proxy = new HTTPProxy.RoutingProxy();

HTTP.createServer(function(request, response) {
  var innerURL = request.url.substr(1);
  var parsedURL = URL.parse(innerURL);
  request.url = innerURL.toLowerCase();

  proxy.proxyRequest(request, response, {
    host: parsedURL.hostname,
    port: 80,
  });
}).listen(process.env.PORT);
