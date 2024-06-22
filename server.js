const { SerialPort } = require('serialport');
const WebSocket = require('ws');
const express = require('express');
const http = require('http');

// Configuração do servidor Express
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let serialPort;

// Tentar abrir a porta serial
function openSerialPort() {
  serialPort = new SerialPort({
    path: 'COM3', // Altere para a porta correta no Windows, por exemplo 'COM3'
    baudRate: 9600,
    autoOpen: false
  });

  serialPort.open((err) => {
    if (err) {
      console.error('Erro ao abrir a porta serial: ', err.message);
      return;
    }
    console.log('Porta serial aberta com sucesso');
  });

  serialPort.on('error', (err) => {
    console.error('Erro na porta serial: ', err.message);
  });

  serialPort.on('data', (data) => {
    console.log(`Dados recebidos: ${data}`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });
}

openSerialPort();

// Servir arquivos estáticos
app.use(express.static('public'));

// Evento de conexão do WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  if (!serialPort.isOpen) {
    ws.send('Erro: Não foi possível conectar à porta serial');
  }

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar o servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
