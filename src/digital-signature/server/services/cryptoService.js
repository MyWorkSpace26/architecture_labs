const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

class CryptoService {
  constructor() {
    this.privateKeyPath = path.join(__dirname, "../keys/privateKey.pem");
    this.publicKeyPath = path.join(__dirname, "../keys/publicKey.pem");
    this.ensureKeysExist();
  }

  ensureKeysExist() {
    if (
      !fs.existsSync(this.privateKeyPath) ||
      !fs.existsSync(this.publicKeyPath)
    ) {
      this.generateKeys();
    }
  }

  generateKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    fs.writeFileSync(this.privateKeyPath, privateKey);
    fs.writeFileSync(this.publicKeyPath, publicKey);

    console.log("RSA keys generated successfully");
  }

  getPrivateKey() {
    return fs.readFileSync(this.privateKeyPath, "utf8");
  }

  getPublicKey() {
    return fs.readFileSync(this.publicKeyPath, "utf8");
  }

  signMessage(message) {
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(message, "utf8");
    sign.end();

    const privateKey = this.getPrivateKey();
    const signature = sign.sign(privateKey, "base64");

    return signature;
  }

  verifySignature(message, signature, publicKeyPem) {
    if (!signature || !message) return false;
    try {
      const verify = crypto.createVerify("RSA-SHA256");
      verify.update(message, "utf8");
      verify.end();

      return verify.verify(publicKeyPem, signature, "base64");
    } catch (error) {
      console.error("Verification error:", error);
      return false;
    }
  }

  generateRandomMessage() {
    const messages = [
      "This is a test message from server",
      "Hello from digital signature server",
      "Server generated random message",
      "Important data transmission",
      "Secure communication test",
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);
    const timestamp = new Date().toISOString();

    return `${messages[randomIndex]} - ${timestamp}`;
  }
}

module.exports = CryptoService;
