const net = require('net');

const HOST = 'localhost';
<<<<<<< HEAD
const PORT = 8000;
const agent = 'server';
=======
const PORT = 8082;
>>>>>>> 015c32f467a5b7127d9fdacccc0dd907d17a34ce

const fileServer = new net.Server();

fileServer.on('connection', (socket) => {
  console.log(`Nova conexão: ${socket.remoteAddress}:${socket.remotePort}`);
  socket.write('agent');

  socket.on('data', (data) => {
    const message = data.toString();
    console.log(`Mensagem de ${socket.remoteAddress}:${socket.remotePort}: ${message}`);

    if (message === 'file') {
      socket.write('Recebendo arquivo...');
      // Aqui você pode adicionar o código para lidar com o recebimento do arquivo
    } else {
      fileServer.getConnections((err, count) => {
        if (err) throw err;
        fileServer.clients.forEach((client) => {
          if (client !== socket) {
            client.write(message);
          }
        });
      });
    }
  });

  socket.on('end', () => {
    console.log(`Conexão fechada: ${socket.remoteAddress}:${socket.remotePort}`);
  });
});

fileServer.listen(PORT, HOST, () => {
  console.log(`Servidor de arquivos ouvindo em ${HOST}:${PORT}`);
});

