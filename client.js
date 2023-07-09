const net = require('net');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const HOST = 'localhost';
const PORT = 8000;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = net.createConnection(PORT, HOST);

client.on('connect', () => {
  console.log(`Connected to ${HOST}:${PORT}`);
  startupMenu();
});

client.on('data', (data) => {
  const message = data.toString();
  console.log(message);
});

client.on('end', () => {
  console.log('Disconnected from server');
  process.exit(0);
});

function sendMessage(message) {
  try {
    client.write(message);
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
  }
}

function startupMenu() {
  rl.question('Menu:\n1. Depositar arquivo\n2. Recuperar arquivo\n3. Sair\nEscolha: ', (choice) => {
    switch (choice) {
      case '1':
        rl.question('Nome do arquivo: ', (fileName) => {
          rl.question('Número de cópias: ', (level) => {
            const filePath = path.join(__dirname, fileName);
            const fileSize = fs.statSync(filePath).size;
            sendMessage(`1|${fileName}|${level}|${fileSize}`);
            fs.createReadStream(filePath).pipe(client);
            startupMenu();
          });
        });
        break;
      case '2':
        rl.question('Nome do arquivo: ', (fileName) => {
          sendMessage(`2|${fileName}|0|0`);
          startupMenu();
        });
        break;
      case '3':
        client.end();
        break;
      default:
        console.log('Opção não reconhecida');
        startupMenu();
        break;
    }
  });
}

client.on('error', (err) => {
  console.error('Erro no cliente:', err);
});

rl.on('close', () => {
  process.exit(0);
});

