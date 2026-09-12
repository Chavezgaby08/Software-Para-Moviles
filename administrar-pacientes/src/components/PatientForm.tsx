import React, { useState } from 'react';
import type { Patient } from '../types';

interface PatientFormProps {
  onAddPatient: (patient: Patient) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onAddPatient }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cc, setCc] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!nombre.trim() || nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (!apellido.trim() || apellido.trim().length < 2) {
      setError('El apellido debe tener al menos 2 caracteres.');
      return;
    }
    if (!/^\d{6,10}$/.test(cc.trim())) {
      setError('La CC debe contener entre 6 y 10 dígitos numéricos.');
      return;
    }

    const newPatient: Patient = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      cc: cc.trim(),
      telefono: telefono.trim() || 'Sin teléfono'
    };

    onAddPatient(newPatient);

    // Limpieza de campos
    setNombre('');
    setApellido('');
    setCc('');
    setTelefono('');
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Agregar Nuevo Paciente</h3>
      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.grid}>
        <div>
          <label>Nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div>
          <label>Apellido *</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div>
          <label>CC (Cédula) *</label>
          <input
            type="text"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div>
          <label>Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      <button type="submit" style={styles.button}>
        Guardar Paciente
      </button>
    </form>
  );
};

const styles: Record<string, React.CSSProperties> = {
  form: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '25px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    margin: '15px 0'
  },
  input: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
  },
  errorAlert: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    margin: '10px 0'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};