const os = require('os');
const { File } = require('./File');
const { Client } = require('./ClientClass');

function close_callback(route, websockets) {
    if (!websockets) {
        try {
            client.send(Client.DISCONNECT_MESSAGE);
            setTimeout(() => {
                client.closeConnection();
                process.exit(0);
            }, 1000);
            for (const thread of Object.values(threading.enumerate())) {
                thread.join();
            }
            process.exit(0);
        } catch (error) {
            process.exit(0);
        }
    }
}

function listDirHashCodes() {
    const files_in_folder = fs.readdirSync('./localFiles');
    const path = `${os.path.dirname(__filename).replace("main.py", "")}localFiles\\`;
    const hashCodes = [];
    const files = [];
    for (const entry of files_in_folder) {
        const fullPath = path.join(path, entry);
        if (fs.statSync(fullPath).isFile()) {
            const file = new File(fullPath, entry);
            files.push(file.obj());
            hashCodes.push(file.sha256_hash);
        }
    }
    return [files, hashCodes];
}

eel.init('www');
eel.start('index.html', { block: false, mode: 'edge-app', close_callback });
console.log("eel.start");
const [dirFiles, hashcodes] = listDirHashCodes();
eel.showFiles(dirFiles);
let writingFile = false;

eel.expose(add_file);
function add_file(byteArray, fileName) {
    writingFile = true;
    const f = fs.openSync(`./localFiles/${fileName}`, 'wb');
    const bytesList = Object.values(byteArray);
    for (const b of bytesList) {
        fs.writeSync(f, Buffer.from([b]));
    }
    fs.closeSync(f);
    writingFile = false;
}