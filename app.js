const https = require('https');
const fs = require('fs');
const config = require('./config');
const app = require('./lib/endpoints');
const eventBus = require('./lib/eventBus');

/**
 * Naming:
 * sid: Group of files
 * key: File
 * fid: {sid}++{key}
 */

// Render assigns its own PORT, so use that if available
const PORT = process.env.PORT || config.port || 3000;
const IFACE = config.iface || '0.0.0.0';

let server;
if (PORT) {
  // HTTP Server
  server = app.listen(PORT, IFACE, () => {
    console.log(`GoKabootar listening on http://${IFACE}:${PORT}`);
    eventBus.emit('listen', server);
  });
}

let httpsServer;
if (config.sslPort && config.sslKeyFile && config.sslCertFile) {
  // HTTPS Server (optional if SSL certs are provided)
  const sslOpts = {
    key: fs.readFileSync(config.sslKeyFile),
    cert: fs.readFileSync(config.sslCertFile)
  };
  httpsServer = https.createServer(sslOpts, app)
    .listen(config.sslPort, IFACE, () => {
      console.log(`GoKabootar listening on https://${IFACE}:${config.sslPort}`);
      eventBus.emit('listen', httpsServer);
    });
}

// graceful shutdown
function shutdown() {
  console.log('GoKabootar shutting down...');
  eventBus.emit('shutdown', server || httpsServer);
  if (server) {
    server.close(() => {
      server = false;
      if (!server && !httpsServer) process.exit(0);
    });
  }
  if (httpsServer) {
    httpsServer.close(() => {
      httpsServer = false;
      if (!server && !httpsServer) process.exit(0);
    });
  }
  setTimeout(() => {
    console.log('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 15 * 1000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
