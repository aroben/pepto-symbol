const HTTPProxy = require('http-proxy');

const TARGET_HOST = process.env.S3_BUCKET + '.s3.amazonaws.com';

// S3 returns 403 errors for files that don't exist. But when symsrv.dll sees a
// 403 it blacklists the server for the rest of the debugging session. So we
// convert 403s to 404s so symsrv.dll doesn't freak out.
function convert403To404(request, response, next) {
  var original = response.writeHead;
  response.writeHead = function() {
    var args = Array.prototype.slice.call(arguments);
    if (args[0] == 403)
      args[0] = 404;
    original.apply(response, args);
  };
  next();
}

// S3 determines the bucket from the Host header.
function fixHostHeader(request, response, next) {
  request.headers['host'] = TARGET_HOST;
  next();
}

// symstore.exe and symsrv.dll don't always agree on the case of the path to a
// given symbol file. Since S3 URLs are case-sensitive, this causes symbol
// loads to fail. To get around this, we assume that the symbols were uploaded
// to S3 with all-lowercase keys, and we lowercase all requests we receive to
// match.
function lowercaseURL(request, response, next) {
  request.url = request.url.toLowerCase();
  next();
}

HTTPProxy.createServer(TARGET_HOST, 80, convert403To404, fixHostHeader, lowercaseURL).listen(process.env.PORT);
