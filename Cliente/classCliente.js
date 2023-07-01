const net = require('net');
class Client {
    static SERVER_HOST = "45.56.119.236";
    static SERVER_PORT = 9000;
    static DISCONNECT_MESSAGE = "!DISCONNECT";
    static HEADER = 64;
    static FORMAT = 'utf-8';

    constructor(PORT, ipAddressFunction, activeConnectionsFunction, numDownloadsFunction, HOST = Client.SERVER_HOST) {
        this.HOST = HOST;
        this.PORT = PORT;
        this.clientServer = new net.Socket();
        this.conn = null;
        this.ender = null;
        this.activeConnectionsFunction = activeConnectionsFunction;
        this.ipAddressFunction = ipAddressFunction;
        this.numDownloadsFunction = numDownloadsFunction;
        console.log(`Created Client Socket: HOST ${this.HOST}, PORT ${this.PORT}`);

        this.startThread = new Thread(this.thread_listen);

        this.isAlive = true;
    }

    closeConnection() {
        console.log("closeConnection");
        this.clientServer.close();
    }

    online() {
        this.clientServer.connect(Client.SERVER_PORT, Client.SERVER_HOST);
        this.send(String(this.PORT));
    }

    uploadFile(message) {
        this.send(`[UPLOAD]${message}`);
    }
}