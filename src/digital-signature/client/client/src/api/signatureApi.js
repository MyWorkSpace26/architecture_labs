import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api/signature";

const signatureApi = {
  async verifySignature(message, signature, publicKey) {
    try {
      const response = await axios.post(`${API_BASE_URL}/verify`, {
        message,
        signature,
        publicKey,
      });
      return response.data;
    } catch (error) {
      console.error("Error verifying signature:", error);
      throw error;
    }
  },

  async verifyServerSignature(message, signature) {
    const response = await axios.post(`${API_BASE_URL}/verify-server`, {
      message,
      signature,
    });
    return response.data;
  },

  async getPublicKey() {
    try {
      const response = await axios.get(`${API_BASE_URL}/public-key`);
      return response.data;
    } catch (error) {
      console.error("Error getting public key:", error);
      throw error;
    }
  },

  async generateSignedMessage() {
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-message`);
      return response.data;
    } catch (error) {
      console.error("Error generating signed message:", error);
      throw error;
    }
  },
};

export default signatureApi;
