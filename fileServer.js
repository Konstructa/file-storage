const net = require('net'); // Importa o módulo net
const fs = require('fs'); // Importa o módulo fs
const path = require('path'); // Importa o módulo path

const HOST = 'localhost'; // Endereço do servidor principal
const PORT = 8082; // Porta do servidor principal

const fileServer = new net.Server(); // Cria um novo servidor
fileServer.clients = []; // Cria um array para armazenar os clientes conectados

fileServer.on('connection', (socket) => { // Evento de conexão
  console.log(`Nova conexão: ${socket.remoteAddress}:${socket.remotePort}`); // Exibe o endereço e a porta do cliente
  fileServer.clients.push(socket); // Adiciona o cliente ao array de clientes
  socket.write('agent'); // Envia a mensagem 'agent' para o cliente

  socket.on('data', (data) => { // Evento de recebimento de dados
    const message = data.toString(); // Converte os dados recebidos em string
    console.log(`Mensagem de ${socket.remoteAddress}:${socket.remotePort}: ${message}`); // Exibe a mensagem recebida

    const parts = message.split('|'); // Divide a mensagem em partes
    if (parts[0] === '1') {
      // Depósito de arquivo
      const file_name = parts[1]; // Nome do arquivo
      const num_replicas = parseInt(parts[2]); // Número de réplicas
      for (let i = 1; i <= num_replicas; i++) { // Loop para criar as réplicas
        const location = `location${i}`; // Nome da pasta
        const location_path = path.join(__dirname, location); // Caminho da pasta
        fs.mkdir(location_path, { recursive: true }, (err) => { // Cria a pasta
          if (err && err.code !== 'EEXIST') { // Verifica se a pasta já existe
            console.log(`Erro ao criar a pasta: ${err.message}`); // Exibe o erro
          } else { // Se a pasta não existir ou já existir
            const file_path = path.join(location_path, file_name); // Caminho do arquivo
            fs.writeFile(file_path, data, (err) => { // Cria o arquivo
              if (err) { // Verifica se houve erro
                console.log(`Erro ao salvar o arquivo: ${err.message}`); // Exibe o erro
              } else { // Se não houver erro
                console.log(`Arquivo salvo em ${location}`); // Exibe a mensagem de sucesso
              }
            });
          }
        });
      }
      // Verificar e atualizar o número de réplicas
      updateReplicas(file_name, num_replicas); // Função para atualizar o número de réplicas
    } else if (parts[0] === '2') { // Se a mensagem for '2'
      // Recuperação de arquivo
      const file_name = parts[1]; // Nome do arquivo
      let file_found = false; // Variável para verificar se o arquivo foi encontrado
      for (let i = 1; i <= 100; i++) { // Loop para procurar o arquivo
        const location = `location${i}`; // Nome da pasta
        const file_path = path.join(__dirname, location, file_name); // Caminho do arquivo
        if (fs.existsSync(file_path)) { // Verifica se o arquivo existe
          fs.readFile(file_path, (err, data) => { // Lê o arquivo
            if (err) { // Verifica se houve erro
              console.log(`Erro ao ler o arquivo: ${err.message}`); // Exibe o erro
              socket.write(`Erro ao ler o arquivo: ${err.message}`); // Envia o erro para o cliente
            } else { // Se não houver erro
              socket.write(data); // Envia o arquivo para o cliente
              file_found = true; // Altera a variável para true
            }
          });
          break; // Interrompe o loop
        }
      }
      if (!file_found) { // Verifica se o arquivo não foi encontrado
        socket.write(`Arquivo não encontrado`); // Envia a mensagem de erro para o cliente
      }
    } else { // Se a mensagem não for '1' nem '2'
      fileServer.getConnections((err, count) => { // Obtém o número de clientes conectados
        if (err) throw err; // Exibe o erro
        fileServer.clients.forEach((client) => { // Loop para enviar a mensagem para todos os clientes
          if (client !== socket) { // Verifica se o cliente é diferente do cliente que enviou a mensagem
            client.write(message); // Envia a mensagem para o cliente
          }
        });
      });
    }
  });

  function updateReplicas(file_name, num_replicas) { // Função para atualizar o número de réplicas
    let current_replicas = 0; // Variável para armazenar o número de réplicas atuais
    for (let i = 1; i <= 100; i++) { // Loop para verificar o número de réplicas atuais
      const location = `location${i}`; // Nome da pasta
      const file_path = path.join(__dirname, location, file_name); // Caminho do arquivo
      if (fs.existsSync(file_path)) { // Verifica se o arquivo existe
        current_replicas++; // Incrementa a variável
      }
    }

    if (current_replicas > num_replicas) { // Verifica se o número de réplicas atuais é maior que o número de réplicas desejado
      // Excluir réplicas extras
      for (let i = current_replicas; i > num_replicas; i--) { // Loop para excluir as réplicas extras
        const location = `location${i}`; // Nome da pasta
        const file_path = path.join(__dirname, location, file_name); // Caminho do arquivo
        fs.unlink(file_path, (err) => { // Exclui o arquivo
          if (err) { // Verifica se houve erro
            console.log(`Erro ao excluir o arquivo: ${err.message}`); // Exibe o erro
          } else { // Se não houver erro
            console.log(`Arquivo excluído de ${location}`); // Exibe a mensagem de sucesso
          }
        });
      }
    }
    for (let i = 1; i <= 100; i++) { // Loop para excluir as pastas vazias
      const location = `location${i}`; // Nome da pasta
      const location_path = path.join(__dirname, location); // Caminho da pasta
      fs.readdir(location_path, (err, files) => { // Lê a pasta
        if (err && err.code !== 'ENOENT') { // Verifica se houve erro
          console.log(`Erro ao ler a pasta: ${err.message}`); // Exibe o erro
        } else if (!files || files.length === 0) { // Se não houver erro e a pasta estiver vazia
          fs.rmdir(location_path, (err) => { // Exclui a pasta
            if (err && err.code !== 'ENOENT') { // Verifica se houve erro
              //console.log(`Erro ao remover a pasta: ${err.message}`);
            } else if (!err) { // Se não houver erro
              console.log(`Pasta ${location} removida`); // Exibe a mensagem de sucesso
            }
          });
        }
      });
    }
  }

  socket.on('end', () => { // Evento de desconexão
    console.log(`Conexão fechada: ${socket.remoteAddress}:${socket.remotePort}`); // Exibe a mensagem de desconexão
  });
});

fileServer.listen(PORT, HOST, () => { // Inicia o servidor de arquivos
  console.log(`Servidor de arquivos ouvindo em ${HOST}:${PORT}`); // Exibe a mensagem de sucesso
});
