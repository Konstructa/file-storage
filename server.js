const { createServer } = require('net');
const fs = require('fs');
const path = require('path');

const HOST = 'localhost';
const PORT = 8000;

const replicaRegistry = {};

const server = createServer((socket) => {
  console.log(`Nova conexão: ${socket.remoteAddress}:${socket.remotePort}`);
  socket.write('agent');

  socket.on('data', (data) => {
    const message = data.toString();
    console.log(`Mensagem de ${socket.remoteAddress}:${socket.remotePort}: ${message}`);

    const [command, fileName, level] = message.split('|');
    if (command === '1') {
      // Depositar arquivo
      const filePath = path.join(__dirname, fileName);
      const writeStream = fs.createWriteStream(filePath);
      console.log(replicaRegistry)

      if (!(fileName in replicaRegistry) && level > 0) {
        createReplicas(fileName, level);
        console.log(`Arquivo ${fileName} depositado com sucesso`);
      } else if (fileName in replicaRegistry && level > replicaRegistry[fileName].length) {
        const numReplicasToAdd = level - replicaRegistry[fileName].length;
        addReplicas(fileName, numReplicasToAdd);
        console.log(`Arquivo ${fileName} já existe, adicionando ${numReplicasToAdd} réplicas`);
      } else if (fileName in replicaRegistry && level < replicaRegistry[fileName].length) {
        const numReplicasToRemove = replicaRegistry[fileName].length - level;
        removeReplicas(fileName, numReplicasToRemove);
        console.log(`Arquivo ${fileName} possui ${level} réplicas, removendo ${numReplicasToRemove} réplicas`);
      } else if (fileName in replicaRegistry && level == replicaRegistry[fileName].length) {
        console.log(`Arquivo ${fileName} já possui ${level} réplicas`);
        return;
      }

     console.log(replicaRegistry)
      /* socket.pipe(writeStream);
       */
    } else if (command === '2') {
      // Recuperar arquivo
      if (fileName in replicaRegistry) {
        console.log(`Arquivo ${fileName} recuperado`);
        // Lógica de recuperação do arquivo
      } else {
        console.log(`Arquivo ${fileName} não encontrado`);
      }
    }
  });

  socket.on('end', () => {
    console.log(`Conexão fechada: ${socket.remoteAddress}:${socket.remotePort}`);
  });
});

function createReplicas(fileName, numReplicas) {
  const replicas = [];
  const fileDir = path.dirname(fileName);
  const fileBaseName = path.basename(fileName);

  for (let i = 0; i < numReplicas; i++) {
    const replicaName = `${fileDir}/${fileBaseName}.replica-${i + 1}`;
    if (fs.existsSync(replicaName)) {
      console.log(`Réplica ${replicaName} já existe. Ignorando...`);
    } else {
      replicas.push(replicaName);
    }
  }

  if (replicas.length > 0) {
    replicaRegistry[fileName] = replicas;
    console.log(`${replicas.length} réplicas criadas para o arquivo ${fileName}`);
    replicateFile(fileName, replicas);
  }
}

/* function addReplicas(fileName, allFiles, numReplicas) {
  const replicas = [];
  const allReplicas = allFiles
  for (let i = numReplicas; i < allReplicas; i++) {
    const replicaName = `${fileName}.replica-${i + 1}`;
    replicas.push(replicaName);
  }
  replicaRegistry[fileName] = replicas;
  console.log(`${numReplicas} réplicas adicionadas para o arquivo ${fileName}`);
  replicateFile(fileName, replicas);
}
 */

function addReplicas(fileName) {
  const replicas = replicaRegistry[fileName] || [];
  const currentReplicas = replicas.length;
  const numAdditionalReplicas = currentReplicas;
  const newReplicas = [];

  for (let i = 0; i < numAdditionalReplicas; i++) {
    const replicaName = `${fileName}.replica-${currentReplicas + i + 1}`;
    newReplicas.push(replicaName);
  }

  replicaRegistry[fileName] = replicas.concat(newReplicas);
  console.log(`${numAdditionalReplicas} réplicas adicionadas para o arquivo ${fileName}`);
}


/* function removeReplicas(fileName, numReplicas) {
  const replicas = replicaRegistry[fileName] || [];
  const currentReplicas = replicas.length;
  const numReplicasToRemove = Math.max(0, currentReplicas - numReplicas);
  if (numReplicasToRemove > 0) {

    for (let i = 0; i < numReplicasToRemove; i++) {
      const replicaName = `${fileName}.replica-${currentReplicas - i}`;
      replicas.push(replicaName);
    }
    const removedReplicas = replicas.splice(-numReplicasToRemove);
    console.log(`${numReplicasToRemove} réplicas removidas para o arquivo ${fileName}`);
    console.log(`Réplicas removidas: ${removedReplicas}`);
    deleteFile(replicaName, removedReplicas);
  }
} */
/* 
function removeReplicas(fileName, numReplicasToRemove) {
  const replicas = replicaRegistry[fileName] || [];
  console.log(replicas.length) 

  if (numReplicasToRemove > 0) {
    const removedReplicas = replicas.splice(-numReplicasToRemove);
    console.log(`${numReplicasToRemove} réplicas removidas para o arquivo ${fileName}`);
    console.log(`Réplicas removidas: ${removedReplicas}`);

    deleteFile(fileName, removeReplicas);
    console.log(removedReplicas)
  }
}
 */

function removeReplicas(fileName) {
  const replicas = replicaRegistry[fileName] || [];
  const numReplicasToRemove = replicas.length;

  if (numReplicasToRemove > 0) {
    const removedReplicas = replicas.splice(-numReplicasToRemove);
    console.log(`${numReplicasToRemove} réplicas removidas para o arquivo ${fileName}`);
    console.log(`Réplicas removidas: ${removedReplicas}`);

    removedReplicas.forEach((replica) => {
      const replicaPath = path.join(__dirname, replica);
      deleteFile(replicaPath);
    });
  }
}




function replicateFile(fileName, replicas) {
  const filePath = path.join(__dirname, fileName);
  console.log(filePath)

  replicas.forEach((replica) => {
    const replicaPath = path.join(__dirname, replica);
    fs.copyFileSync(filePath, replicaPath);
  });

  console.log(`Arquivo ${filePath} replicado para as réplicas: ${replicas.join(', ')}`);
}
    
function deleteFile(fileName, replicas) {
  const fileDir = path.dirname(fileName);
  const fileBaseName = path.basename(fileName);

  for (let i = 0; i < replicas.length; i++) {
    const replicaName = replicas[i];
    const replicaPath = path.join(fileDir, replicaName);
    fs.unlink(replicaPath, (err) => {
      if (err) {
        console.error(`Erro ao excluir a réplica ${replicaName} do arquivo ${fileName}:`, err);
      } else {
        console.log(`Réplica ${replicaName} do arquivo ${fileName} removida com sucesso`);
      }
    });
  }
}


 

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});

server.on('error', (err) => {
  console.error('Erro no servidor:', err);
});