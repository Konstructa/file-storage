
const net = require('net'); 
const fs = require('fs'); 
const path = require('path'); 

const HOST = 'localhost'; 
const PORT = 8000 // Porta do servidor principal

const fileServer = new net.Server(); 
fileServer.clients = [];

fileServer.on('connection', (socket) => { 
  console.log(`Nova conexão: ${socket.remoteAddress}:${socket.remotePort}`); 
  fileServer.clients.push(socket); //
  socket.write('agent'); 

  socket.on('data', (data) => { // Evento de recebimento de dados
    const message = data.toString(); // Converte os dados recebidos em string
    console.log(`Mensagem de ${socket.remoteAddress}:${socket.remotePort}: ${message}`); // Exibe a mensagem recebida

    const parts = message.split('|'); 
    if (parts[0] === '1') {
      // Depósito de arquivo
      const file_name = parts[1]; // Nome do arquivo
      const num_replicas = parseInt(parts[2]); // Número de réplicas
     
      for (let i = 1; i <= num_replicas; i++) { // Loop para criar as réplicas
        const location = `location${i}`; 
        const location_path = path.join(__dirname, location); 
        fs.mkdir(location_path, { recursive: true }, (err) => { 
          if (err && err.code !== 'EEXIST') { 
            console.log(`Erro ao criar a pasta: ${err.message}`); 
          } else { 
            const file_path = path.join(location_path, file_name); 
            fs.writeFile(file_path, data, (err) => { 
              if (err) { 
                console.log(`Erro ao salvar o arquivo: ${err.message}`); 
              } else { 
                console.log(`Arquivo salvo em ${location}`); 
              }
            });
          }
        });
      } 
     
      // Verificar e atualizar o número de réplicas
      updateReplicas(file_name, num_replicas); 
    } else if (parts[0] === '2') { 
      // Recuperação de arquivo
      const file_name = parts[1]; 
      let file_found = false; 
      for (let i = 0; i <= 100; i++) {
        const location = `location${i}`; 
        const file_path = path.join(__dirname, location, file_name); 
        if (fs.existsSync(file_path)) { 
          fs.readFile(file_path, (err, data) => { 
            if (err) { 
              console.log(`Erro ao ler o arquivo: ${err.message}`); 
              socket.write(`Erro ao ler o arquivo: ${err.message}`); 
            } else { 
              socket.write(data); // Envia o arquivo para o cliente
              file_found = true; 
            }
          });
          break; 
        }
      }
      if (!file_found) { 
        socket.write(`Arquivo não encontrado`); 
      }
    } else { 
      fileServer.getConnections((err, count) => { 
        if (err) throw err;
        fileServer.clients.forEach((client) => { // Loop para enviar a mensagem para todos os clientes
          if (client !== socket) { 
            client.write(message); 
          }
        });
      });
    }
  });

  function updateReplicas(file_name, num_replicas) { // Função para atualizar o número de réplicas
    let current_replicas = 0;
    for (let i = 1; i <= 100; i++) { 
      const location = `location${i}`; 
      const file_path = path.join(__dirname, location, file_name); 
      if (fs.existsSync(file_path)) { 
        current_replicas++; 
      }
    }

    if (current_replicas > num_replicas) { // Verifica se o número de réplicas atuais é maior que o número de réplicas desejado
      // Excluir réplicas extras
      for (let i = current_replicas; i > num_replicas; i--) { 
        const location = `location${i}`; 
        const file_path = path.join(__dirname, location, file_name); 
        fs.unlink(file_path, (err) => { // Exclui o arquivo
          if (err) { 
            console.log(`Erro ao excluir o arquivo: ${err.message}`); 
          } else { 
            console.log(`Arquivo excluído de ${location}`); 
          }
        });
      }
    }
    for (let i = 1; i <= 100; i++) { 
      const location = `location${i}`; 
      const location_path = path.join(__dirname, location); 
      fs.readdir(location_path, (err, files) => { 
        if (err && err.code !== 'ENOENT') { 
          console.log(`Erro ao ler a pasta: ${err.message}`); 
        } else if (!files || files.length === 0) { 
          fs.rmdir(location_path, (err) => { 
            if (err && err.code !== 'ENOENT') { 
              //console.log(`Erro ao remover a pasta: ${err.message}`);
            } else if (!err) { 
              console.log(`Pasta ${location} removida`); 
            }
          });
        }
      });
    }
  }

  socket.on('end', () => { 
    console.log(`Conexão fechada: ${socket.remoteAddress}:${socket.remotePort}`); 
  });
});

fileServer.listen(PORT, HOST, () => { 
  console.log(`Servidor de arquivos ouvindo em ${HOST}:${PORT}`);
});

