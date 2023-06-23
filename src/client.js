const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = 'localhost';
const filePath = 'src/teste/arquivo.txt'; // Substitua pelo caminho correto do arquivo no seu computador

fs.readFile(filePath, (err, fileData) => {
  if (err) {
    console.error('Erro ao ler o arquivo:', err);
    return;
  }

  const filename = path.basename(filePath);

  const requestOptions = { 
    hostname: HOST,
    port: PORT,
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileData.length,
      'File-Name': filename
    }
  };


  const request = http.request(requestOptions, response => {
    let responseData = '';

    response.on('data', chunk => {
      responseData += chunk;
    });

    response.on('end', () => {
      console.log('Resposta do servidor:', responseData);
    });
  });

  request.on('error', error => {
    console.error('Ocorreu um erro na conexão:', error);
  });

  // Envie os dados do arquivo para o servidor
  request.write(fileData);
  request.end();
});