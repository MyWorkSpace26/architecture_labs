import React from 'react';
import ClientSignature from '../components/ClientSignature';
import ServerSignature from '../components/ServerSignature';

const Home = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Демонстрация электронной цифровой подписи
      </h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>О системе:</h3>
        <p style={{ margin: 0, color: '#6c757d' }}>
          Это приложение демонстрирует работу электронной цифровой подписи (ЭЦП) на основе RSA алгоритма.
          Система поддерживает два сценария использования ЭЦП в клиент-серверном взаимодействии.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ClientSignature />
        <ServerSignature />
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Техническая информация:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
          <li>Алгоритм подписи: RSA-SHA256</li>
          <li>Длина ключа: 2048 бит</li>
          <li>Клиент использует Web Crypto API</li>
          <li>Сервер использует встроенный crypto модуль Node.js</li>
          <li>Протокол взаимодействия: HTTP REST API</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
