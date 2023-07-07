const net = require('net');
const createConnection = net.createConnection;
const fs = require('fs');
const path = require('path');

const HOST = 'localhost';
const PORT = 8081;
const agent = 'server';

const client = createConnection(PORT, HOST);

client.on('connect', () => {
  console.log(`Connected to ${HOST}:${PORT}`);
});

client.on('data', (data) => {
  const message = data.toString();
  console.log(message);
});

client.on('end', () => {
  console.log('Disconnected from server');
});

function sendMessage(message) {
  client.write(message);
}

function processMessage(message) {
  // Process the message
}

client.on('data', (data) => {
  const message = data.toString();
  processMessage(message);
});
