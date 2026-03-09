import React, { useState, useEffect } from 'react';
import signatureApi from '../api/signatureApi';

const ServerSignature = () => {
  const [serverPublicKey, setServerPublicKey] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServerPublicKey();
  }, []);

  const fetchServerPublicKey = async () => {
    try {
      setLoading(true);
      const response = await signatureApi.getPublicKey();
      setServerPublicKey(response.publicKey);
    } catch (error) {
      console.error('Error fetching public key:', error);
      setError('Ошибка получения публичного ключа сервера');
    } finally {
      setLoading(false);
    }
  };

  const importPublicKey = async (pem) => {
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length).replace(/\s/g, '');
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer.buffer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );
  };

  const verifySignatureLocally = async (message, signature, publicKeyPem) => {
    try {
      const publicKey = await importPublicKey(publicKeyPem);
      
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      
      const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
      
      const isValid = await window.crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        publicKey,
        signatureBuffer,
        data
      );
      
      return isValid;
    } catch (error) {
      console.error('Error in local verification:', error);
      return false;
    }
  };

  const handleGenerateAndVerify = async () => {
    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await signatureApi.generateSignedMessage();
      setMessage(response.message);
      setSignature(response.signature);

      const result = await signatureApi.verifyServerSignature(
        response.message,
        response.signature
      );

      setVerificationResult(result);
    } catch (error) {
      console.error('Error in generate and verify process:', error);
      setError('Ошибка при генерации и проверке сообщения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Сценарий 2: Подпись на стороне сервера</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={fetchServerPublicKey}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Загрузка...' : 'Обновить публичный ключ'}
        </button>
        
        <button
          onClick={handleGenerateAndVerify}
          disabled={loading || !serverPublicKey}
          style={{
            padding: '8px 16px',
            backgroundColor: (loading || !serverPublicKey) ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || !serverPublicKey) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Обработка...' : 'Получить и проверить сообщение'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      {serverPublicKey && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Публичный ключ сервера:</h4>
          <textarea
            value={serverPublicKey}
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

      {message && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Сообщение от сервера:</h4>
          <textarea
            value={message}
            readOnly
            style={{ 
              width: '100%', 
              height: '80px', 
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
      )}

      {signature && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Подпись сервера:</h4>
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

      {verificationResult && (
        <div style={{ 
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

      {!serverPublicKey && !loading && (
        <div style={{ color: '#666', fontStyle: 'italic' }}>
          Нажмите "Обновить публичный ключ" для начала работы
        </div>
      )}
    </div>
  );
};

export default ServerSignature;
