const CryptoService = require("../services/cryptoService");

class SignatureController {
  constructor() {
    this.cryptoService = new CryptoService();

    this.verifySignature = this.verifySignature.bind(this);
    this.verifyServerMessage = this.verifyServerMessage.bind(this);
    this.getPublicKey = this.getPublicKey.bind(this);
    this.generateSignedMessage = this.generateSignedMessage.bind(this);
  }

  async verifySignature(req, res) {
    try {
      const { message, signature, publicKey } = req.body;

      if (!message || !signature || !publicKey) {
        return res.status(400).json({
          error: "Missing required fields: message, signature, publicKey",
        });
      }

      const isValid = this.cryptoService.verifySignature(
        message,
        signature,
        publicKey
      );

      res.json({
        valid: isValid,
        message: isValid ? "Signature is valid" : "Signature is invalid",
      });
    } catch (error) {
      console.error("Error in verifySignature:", error);
      res.status(500).json({
        error: "Internal server error during signature verification",
      });
    }
  }

  async verifyServerMessage(req, res) {
    try {
      const { message, signature } = req.body;

      const publicKey = this.cryptoService.getPublicKey();

      const isValid = this.cryptoService.verifySignature(
        message,
        signature,
        publicKey
      );

      res.json({
        valid: isValid,
        message: isValid ? "Сообщение подлинное" : "Подпись недействительна",
      });
    } catch (error) {
      res.status(500).json({ error: "Verification error" });
    }
  }

  async getPublicKey(req, res) {
    try {
      const publicKey = this.cryptoService.getPublicKey();

      res.json({
        publicKey: publicKey,
      });
    } catch (error) {
      console.error("Error in getPublicKey:", error);
      res.status(500).json({
        error: "Internal server error while getting public key",
      });
    }
  }

  async generateSignedMessage(req, res) {
    try {
      const message = this.cryptoService.generateRandomMessage();
      const signature = this.cryptoService.signMessage(message);

      res.json({
        message: message,
        signature: signature,
      });
    } catch (error) {
      console.error("Error in generateSignedMessage:", error);
      res.status(500).json({
        error: "Internal server error while generating signed message",
      });
    }
  }
}

module.exports = SignatureController;
