import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Credenciales fijas de la PWA
    if (email.trim() === 'admin@mediclinic.com' && password === 'admin123') {
      localStorage.setItem('pwa_mediclinic_logged', 'true');
      onLoginSuccess();
    } else {
      setError('Credenciales incorrectas. Verifique el usuario y la contraseña.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>MediClinic - Admin PWA</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Iniciar Sesión</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <div style={styles.inputGroup}>
          <label>Correo Electrónico</label>
          <input
            type="email"
            placeholder="admin@mediclinic.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="admin123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>
          Ingresar
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  errorAlert: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '15px',
    border: '1px solid #ef9a9a'
  },
  inputGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  }
};