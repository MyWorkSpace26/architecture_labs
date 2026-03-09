const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/signature", signatureRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Digital Signature Server API",
    endpoints: [
      "POST /api/signature/verify - Verify signature",
      "GET /api/signature/public-key - Get server public key",
      "POST /api/signature/generate-message - Generate signed message",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Digital Signature Server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  POST /api/signature/verify`);
  console.log(`  GET /api/signature/public-key`);
  console.log(`  POST /api/signature/generate-message`);
});
