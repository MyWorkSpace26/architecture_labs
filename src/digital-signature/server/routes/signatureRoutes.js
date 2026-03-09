const express = require("express");
const SignatureController = require("../controllers/signatureController");

const router = express.Router();
const signatureController = new SignatureController();

router.post("/verify", signatureController.verifySignature);
router.get("/public-key", signatureController.getPublicKey);
router.post("/generate-message", signatureController.generateSignedMessage);
router.post("/verify-server", signatureController.verifyServerMessage);

module.exports = router;
