const fs = require('fs');
const crypto = require('crypto');

function limit_to_two_decimals(n) {
    return Math.floor(n * 100) / 100;
}

class File {
    constructor(fullPath, name) {
        this.path = fullPath;
        this.sizeBytes = fs.statSync(fullPath).size;
        this.size = this.convert_bytes();
        this.type = require('path').extname(fullPath);
        this.name = name;
        const byte = fs.readFileSync(fullPath);
        this.sha256_hash = crypto.createHash('sha256').update(byte).digest('hex');
    }

    convert_bytes() {
        if (this.sizeBytes < 1024) {
            return `${this.sizeBytes} Bytes`;
        } else if (this.sizeBytes < (1024 * 1024)) {
            return `${limit_to_two_decimals(this.sizeBytes / 1024)} KB`;
        } else if (this.sizeBytes < (1024 * 1024 * 1024)) {
            return `${limit_to_two_decimals(this.sizeBytes / (1024 * 1024))} MB`;
        } else {
            return `${limit_to_two_decimals(this.sizeBytes / (1024 * 1024 * 1024))} GB`;
        }
    }

    obj() {
        return {
            "name": this.name,
            "sizeBytes": this.sizeBytes,
            "size": this.size,
            "type": this.type,
            "sha256": this.sha256_hash
        };
    }

    toString() {
        return `File Name: ${this.name}, File Size: ${this.size}, File Type: ${this.type}, sha256:${this.sha256_hash}`;
    }
}

module.exports = File;