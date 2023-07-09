const net = require('net'); // https://nodejs.org/api/net.html
const readline = require('readline'); // https://nodejs.org/api/readline.html
const fs = require('fs'); // https://nodejs.org/api/fs.html
const path = require('path'); // https://nodejs.org/api/path.html

let current_mode = ''; // Variável para armazenar o modo atual
let current_file_name = ''; // Variável para armazenar o nome do arquivo atual

const HOST = 'localhost'; // Endereço do servidor
const PORT = 8083; // Porta do servidor
const agent = 'client'; // Nome do agente

const rl = readline.createInterface({ // Cria uma interface para leitura de dados
  input: process.stdin, // Define a entrada de dados
  output: process.stdout // Define a saída de dados
});

const client = net.createConnection(PORT, HOST); // Cria uma conexão com o servidor
const FILE_SERVER_PORT = 8082; // Porta do servidor de arquivos
const fileServerClient = net.createConnection(FILE_SERVER_PORT, HOST); // Cria uma conexão com o servidor de arquivos

client.on('error', (err) => { // Trata erros de conexão
  console.log(`Erro no cliente: ${err.message}`); // Exibe o erro
});

client.on('connect', () => { // Trata eventos de conexão
  console.log(`Connected to ${HOST}:${PORT}`); // Exibe uma mensagem de conexão
});

client.on('data', (data) => { // Trata eventos de recebimento de dados
  const message = data.toString(); // Converte os dados recebidos para string
  console.log(message); // Exibe a mensagem recebida
});

client.on('end', () => { // Trata eventos de desconexão
  console.log('Disconnected from server'); // Exibe uma mensagem de desconexão
  process.exit(0); // Finaliza o processo
});

fileServerClient.on('connect', () => { // Trata eventos de conexão
  console.log(`Connected to file server at ${HOST}:${FILE_SERVER_PORT}`); // Exibe uma mensagem de conexão
  startupMenu(); // Exibe o menu inicial
});

fileServerClient.on('data', (data) => { // Trata eventos de recebimento de dados
  const message = data.toString(); // Converte os dados recebidos para string
  if (current_mode === 'retrieve') { // Verifica se o modo atual é de recuperação de arquivo
    // Salvar o conteúdo do arquivo na raiz do programa
    const file_path = path.join(__dirname, current_file_name); // Define o caminho do arquivo
    fs.writeFile(file_path, data, (err) => { // Salva o arquivo
      if (err) { // Verifica se houve erro
        console.log(`Erro ao salvar o arquivo: ${err.message}`); // Exibe o erro
      } else { // Caso não haja erro
        console.log(`Arquivo salvo em ${file_path}`); // Exibe uma mensagem de sucesso
      }
    });
  }
});

fileServerClient.on('end', () => { // Trata eventos de desconexão
  console.log('Disconnected from file server'); // Exibe uma mensagem de desconexão
});

function sendMessage(message) { // Função para enviar mensagens para o servidor
  fileServerClient.write(message) // Envia a mensagem para o servidor
}

function startupMenu() { // Função para exibir o menu inicial
  rl.question('\nMenu:\n1. Depositar arquivo\n2. Recuperar arquivo\n3. Sair\nEscolha: ', (choice) => { // Exibe o menu
    switch (choice) { // Verifica a opção escolhida
      case '1': // Caso a opção seja 1
        current_mode = 'deposit'; // Define o modo atual como depósito
        rl.question('Nome do arquivo: ', (file_name) => { // Pergunta o nome do arquivo
          rl.question('Número de cópias: ', (level) => { // Pergunta o número de cópias
            try { // Tenta ler o arquivo
              const file_path = path.join(__dirname, file_name); // Define o caminho do arquivo
              const file_size = fs.statSync(file_path).size; // Obtém o tamanho do arquivo
              fileServerClient.write(`1|${file_name}|${level}|${file_size}`); // Envia a mensagem para o servidor
              fs.createReadStream(file_path).pipe(fileServerClient, { end: false }); // Envia o arquivo para o servidor
              console.log(`Enviando arquivo para o servidor de arquivos: ${file_name}`); // Exibe uma mensagem de sucesso
            } catch (err) { // Caso haja erro
              console.log(`Erro ao ler o arquivo: ${err.message}`); // Exibe o erro
            }
            startupMenu(); // Exibe o menu inicial
          });
        });
        break; // Finaliza o switch

      case '2': // Caso a opção seja 2
        current_mode = 'retrieve'; // Define o modo atual como recuperação
        rl.question('Nome do arquivo: ', (file_name) => { // Pergunta o nome do arquivo
          current_file_name = file_name; // Define o nome do arquivo atual
          sendMessage(`2|${file_name}|0|0`); // Envia a mensagem para o servidor
          startupMenu(); // Exibe o menu inicial
        });
        break; // Finaliza o switch
      case '3': // Caso a opção seja 3
        client.end(); // Finaliza a conexão com o servidor
        break; // Finaliza o switch
      default: // Caso a opção não seja reconhecida
        console.log('Opção não reconhecida'); // Exibe uma mensagem de erro
        startupMenu(); // Exibe o menu inicial
        break;
    }
  });
}
