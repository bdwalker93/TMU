var fs = require('fs');
var SMTPServer = require('smtp-server').SMTPServer;
var server = new SMTPServer({
  secure: true,
  logger: true,
  maxClients: 5,
  onData: function(stream, session, callback) {
    stream.pipe(process.stdout); // print message to console
    stream.on('end', callback);
  },
  key: fs.readFileSync(__dirname+'/tls/key.pem'),
  cert: fs.readFileSync(__dirname+'/tls/cert.pem')
});

server.on('error', function(err){
    console.log('Error %s', err.message);
});

server.listen(3000);
