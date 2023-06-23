const fs = require('fs');
const path = require('path');
const http = require('http');
const PORT = 3000;
const replicaDirectory = 'replicas';




const server = http.createServer((request, response) => {
  if (request.method === 'POST') {
    const filename = request.headers['file-name'];
    const fileData = [];

    request.on('data', chunk => {
      fileData.push(chunk);
    });

    request.on('end', () => {
      const filePath = path.join(replicaDirectory, filename);

      fs.writeFile(filePath, Buffer.concat(fileData), error => {
        if (error) {
          console.error('Erro ao escrever o arquivo:', error);
          response.statusCode = 500;
          response.end('Erro ao armazenar o arquivo');
          return;
        }

        console.log(`Arquivo ${filePath} armazenado.`);
        response.statusCode = 200;
        response.end('Arquivo armazenado com sucesso!');
      });
    });
  } else {
    response.statusCode = 400;
    response.end('Requisição inválida');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});