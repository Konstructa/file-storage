// Criado em: 01/07/2023
// Última modificação: 09/07/2023
// Autores: Diego Anjos
//          Glauber Gouveia
//          Laisa Pereira
//          Victor Rafael
//          Milena Limoeiro
// Disciplina: MATA59 - Redes de Computadores
// Professor: Gustavo Bittencourt Figueiredo 
// Universidade Federal do Bahia - UFBA
// Node.js v12.22.9
// 

const net = require('net'); // https://nodejs.org/api/net.html

const HOST = 'localhost'; // Endereço do servidor
const PORT = 8083; // Porta do servidor

const server = new net.Server(); // Cria um novo servidor
server.clients = []; // Cria um array para armazenar os clientes conectados

server.on('connection', (socket) => { // Trata eventos de conexão
  console.log(`Nova conexão: ${socket.remoteAddress}:${socket.remotePort}`); // Exibe o endereço e a porta do cliente
  server.clients.push(socket); // Adiciona o cliente ao array de clientes
  socket.write('agent'); // Envia a mensagem 'agent' para o cliente

  socket.on('error', (err) => { // Trata eventos de erro
    console.log(`Erro no servidor: ${err.message}`); // Exibe o erro
  });

  socket.on('data', (data) => { // Trata eventos de recebimento de dados
    const message = data.toString(); // Converte os dados recebidos em string
    console.log(`Recebendo dados do cliente: ${message}`); // Exibe a mensagem recebida
    console.log(`Mensagem de ${socket.remoteAddress}:${socket.remotePort}: ${message}`); // Exibe a mensagem recebida

    server.getConnections((err, count) => { // Obtém o número de clientes conectados
      if (err) throw err; // Trata erros
      server.clients.forEach((client) => { // Loop para enviar a mensagem para todos os clientes conectados
        console.log(`Enviando mensagem para o cliente: ${message}`); // Exibe a mensagem enviada
        if (client !== socket) { // Verifica se o cliente é diferente do cliente que enviou a mensagem
          client.write(message); // Envia a mensagem para o cliente
        }
      });
    });
  });

  socket.on('end', () => { // Trata eventos de desconexão
    console.log(`Conexão fechada: ${socket.remoteAddress}:${socket.remotePort}`); // Exibe o endereço e a porta do cliente
  });
});

server.listen(PORT, HOST, () => { // Inicia o servidor
  console.log(`Servidor ouvindo em ${HOST}:${PORT}`); // Exibe uma mensagem de sucesso
});


