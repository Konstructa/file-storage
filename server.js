const net = require('net'); 

const HOST = 'localhost'; 
const PORT = 8083; 

const server = new net.Server(); 
server.clients = []; 


// Trata eventos de conexão e interage com o cliente
server.on('connection', (socket) => { 
  console.log(`Nova conexão: ${socket.remoteAddress}:${socket.remotePort}`); 
  server.clients.push(socket); 
  socket.write('agent'); 

  socket.on('error', (err) => { 
    console.log(`Erro no servidor: ${err.message}`); 
  });

// Trata eventos de recebimento de dados e envia para o cliente

  socket.on('data', (data) => { 
    const message = data.toString(); 
    console.log(`Recebendo dados do cliente: ${message}`); 
    console.log(`Mensagem de ${socket.remoteAddress}:${socket.remotePort}: ${message}`); 

    server.getConnections((err, count) => { 
      if (err) throw err; 
      server.clients.forEach((client) => { 
        console.log(`Enviando mensagem para o cliente: ${message}`); 
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
  console.log(`Servidor ouvindo em ${HOST}:${PORT}`); 
});


