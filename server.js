const net = require('net');

const HOST = 'localhost';
const PORT = 8083;

const server = new net.Server();

server.on('connection', (socket) => {
  console.log(`Nova conexão: ${socket.remoteAddress}:${socket.remotePort}`);
  socket.write('agent');

  socket.on('data', (data) => {
    const message = data.toString();
    console.log(`Mensagem de ${socket.remoteAddress}:${socket.remotePort}: ${message}`);

    server.getConnections((err, count) => {
      if (err) throw err;
      server.clients.forEach((client) => {
        if (client !== socket) {
          client.write(message);
        }
      });
    });
  });

  socket.on('end', () => {
    console.log(`Conexão fechada: ${socket.remoteAddress}:${socket.remotePort}`);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor principal ouvindo em ${HOST}:${PORT}`);
});
