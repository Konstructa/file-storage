const net = require('net');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const os = require('os');

const HOST = 'localhost';
const PORT = 8081;
const agent = 'client';

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
  client.write(message);
}

function startupMenu() {
  rl.question('Menu:\n1. Depositar arquivo\n2. Recuperar arquivo\n3. Sair\nEscolha: ', (choice) => {
    switch (choice) {
      case '1':
        rl.question('Nome do arquivo: ', (file_name) => {
          rl.question('Número de cópias: ', (level) => {
            const file_path = path.join(__dirname, file_name);
            const file_size = fs.statSync(file_path).size;
            sendMessage(`1|${file_name}|${level}|${file_size}`);
            fs.createReadStream(file_path).pipe(client);
            startupMenu();
          });
        });
        break;
      case '2':
        rl.question('Nome do arquivo: ', (file_name) => {
          sendMessage(`2|${file_name}|0|0`);
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
