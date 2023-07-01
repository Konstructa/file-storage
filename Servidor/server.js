const errno = require('errno');
const net = require('net');
const { Worker } = require('worker_threads');
const SERVER = '45.56.119.236';

const PORT = 9000;
const ADDR = { host: SERVER, port: PORT };
const DISCONNECT_MESSAGE = "!DISCONNECT";
const CONNECTIONS = {};
const HEADER = 64;
const FORMAT = 'utf-8';
const server = net.createServer();
try {
    server.listen(ADDR);
} catch (e) {
    console.log(e.toString());
}
function send_message(conn, msg) {
    const message = Buffer.from(msg, 'utf-8');
    const msg_length = message.length;
    const send_length = Buffer.alloc(HEADER);
    send_length.write(msg_length.toString(), 'utf-8');
    conn.write(send_length);
    conn.write(message);
}
function handle_client(conn) {
    const addr = conn.remoteAddress + ":" + conn.remotePort;
    console.log("[NEW CONNECTION] " + addr + " connected");
    CONNECTIONS[addr] = conn;
    for (const connection of Object.values(CONNECTIONS)) {
        const active_connections = "[ACTIVE CONNECTIONS] " + (Worker.threadId - 3).toString();
        send_message(connection, active_connections);
    }
    let connected = true;
    try {
        while (connected) {
            const msg_length_buffer = Buffer.alloc(HEADER);
            conn.read(msg_length_buffer, 0, HEADER, null, (err, bytesRead, buffer) => {
                if (err) {
                    console.log(err.toString());
                    return;
                }
                const msg_length = parseInt(buffer.toString('utf-8'));
                const msg_buffer = Buffer.alloc(msg_length);
                conn.read(msg_buffer, 0, msg_length, null, (err, bytesRead, buffer) => {
                    if (err) {
                        console.log(err.toString());
                        return;
                    }
                    const msg = buffer.toString('utf-8');
                    console.log("received msg:");
                    console.log(msg);
                    console.log();
                    console.log();
                    if (msg === DISCONNECT_MESSAGE) {
                        console.log("Disconnected: " + addr);
                        delete CONNECTIONS[addr];
                        for (const connection of Object.values(CONNECTIONS)) {
                            const active_connections = "[ACTIVE CONNECTIONS] " + (Worker.threadId - 3).toString();
                            send_message(connection, active_connections);
                        }
                        connected = false;
                    }
                });
            });
        }
    } catch (e) {
        console.log(e.toString());
    }
}