var HTTP = require('http')
  , HTTPProxy = require('http-proxy')
  , URL = require('url')
  ;

HTTPProxy.createServer(function(request, response, proxy) {
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
