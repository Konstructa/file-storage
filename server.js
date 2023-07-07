import { createServer } from 'net';
const HOST = 'localhost';
const PORT = 8081;

const server = createServer((socket) => {
  console.log(`Nova conexão: ${socket.remoteAddress}:${socket.remotePort}`);
  socket.write('agent');

  socket.on('data', (data) => {
    const message = data.toString();
    console.log(`Mensagem de ${socket.remoteAddress}:${socket.remotePort}: ${message}`);
    server.getConnections((err, count) => {
      if (err) throw err;
      server.connections.forEach((conn) => {
        if (conn !== socket) {
          conn.write(message);
        }
      });
    });
  });

  socket.on('end', () => {
    console.log(`Conexão fechada: ${socket.remoteAddress}:${socket.remotePort}`);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
