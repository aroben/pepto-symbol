var http = require('http');
var httpProxy = require('http-proxy');

const TARGET_HOST = process.env.S3_BUCKET + '.s3.amazonaws.com';
const TARGET = 'http://' + TARGET_HOST;
const PATH_PREFIX = process.env.PATH_PREFIX || '';

// Create a proxy server with custom application logic.
var proxy = httpProxy.createProxyServer({});

// S3 returns 403 errors for files that don't exist. But when symsrv.dll sees a
// 403 it blacklists the server for the rest of the debugging session. So we
// convert 403s to 404s so symsrv.dll doesn't freak out.
proxy.on('proxyReq', function(proxyReq, request, response, options) {
  var original = response.writeHead;
  response.writeHead = function() {
    var args = Array.prototype.slice.call(arguments);
    if (args[0] == 403)
      args[0] = 404;
    original.apply(response, args);
  };
});

// S3 determines the bucket from the Host header.
proxy.on('proxyReq', function(proxyReq, request, response, options) {
  proxyReq.setHeader('Host', TARGET_HOST);
});

// symstore.exe and symsrv.dll don't always agree on the case of the path to a
// given symbol file. Since S3 URLs are case-sensitive, this causes symbol
// loads to fail. To get around this, we assume that the symbols were uploaded
// to S3 with all-lowercase keys, and we lowercase all requests we receive to
// match.
proxy.on('proxyReq', function(proxyReq, request, response, options) {
  proxyReq.path = PATH_PREFIX + proxyReq.path.toLowerCase();
});

http.createServer(function(request, response) {
  proxy.web(request, response, { target: TARGET });
}).listen(process.env.PORT);
