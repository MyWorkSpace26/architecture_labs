import React, { useState } from 'react';
import signatureApi from '../api/signatureApi';

const ClientSignature = () => {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateKeyPair = async () => {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['sign', 'verify']
      );

      const publicKeyPem = await exportPublicKey(keyPair.publicKey);
      setPublicKey(publicKeyPem);

      return keyPair;
    } catch (error) {
      console.error('Error generating key pair:', error);
      setError('Ошибка генерации ключей');
    }
  };

  const exportPublicKey = async (publicKey) => {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
    const exportedAsBase64 = btoa(exportedAsString);
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = exportedAsBase64.match(/.{1,64}/g).join('\n');
    return `${pemHeader}\n${pemContents}\n${pemFooter}`;
  };

  const signMessage = async (message, privateKey) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    const signature = await window.crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      data
    );
    
    return btoa(String.fromCharCode.apply(null, new Uint8Array(signature)));
  };

  const handleSignAndVerify = async () => {
    if (!message.trim()) {
      setError('Введите сообщение для подписи');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const keyPair = await generateKeyPair();
const publicKeyPem = await exportPublicKey(keyPair.publicKey);
setPublicKey(publicKeyPem);

const signature = await signMessage(message, keyPair.privateKey);
setSignature(signature);

      const result = await signatureApi.verifySignature(message, signature, publicKeyPem);
      setVerificationResult(result);
    } catch (error) {
      console.error('Error in sign and verify process:', error);
      setError('Ошибка при подписи и проверке сообщения');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOnly = async () => {
    if (!message || !signature || !publicKey) {
      setError("Нет данных для проверки");
      return;
    }

    try {
      setLoading(true);
      const result = await signatureApi.verifySignature(
        message,
        signature,
        publicKey
      );
      setVerificationResult(result);
    } catch (error) {
      setError("Ошибка проверки подписи");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Сценарий 1: Подпись на стороне клиента</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Сообщение для подписи:
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите ваше сообщение..."
          style={{ 
            width: '100%', 
            height: '80px', 
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      <button
        onClick={handleSignAndVerify}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Обработка...' : 'Подписать и проверить'}
      </button>

      <button
        onClick={handleVerifyOnly}
        style={{
          padding: "10px 20px",
          marginLeft: "10px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Проверить подпись
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}

      {signature && (
        <div style={{ marginTop: '15px' }}>
          <h4>Подпись:</h4>
          <textarea
            value={signature}
            readOnly
            style={{ 
              width: '100%', 
              height: '60px', 
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
        </div>
      )}

      {publicKey && (
        <div style={{ marginTop: '15px' }}>
          <h4>Публичный ключ:</h4>
          <textarea
            value={publicKey}
            readOnly
            style={{ 
              width: '100%', 
              height: '120px', 
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
        </div>
      )}

      {verificationResult && (
        <div style={{ 
          marginTop: '15px',
          padding: '10px',
          backgroundColor: verificationResult.valid ? '#d4edda' : '#f8d7da',
          border: `1px solid ${verificationResult.valid ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          <h4 style={{ 
            color: verificationResult.valid ? '#155724' : '#721c24',
            margin: '0 0 5px 0'
          }}>
            Результат проверки: {verificationResult.valid ? 'VALID' : 'INVALID'}
          </h4>
          <p style={{ margin: 0, color: verificationResult.valid ? '#155724' : '#721c24' }}>
            {verificationResult.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientSignature;
