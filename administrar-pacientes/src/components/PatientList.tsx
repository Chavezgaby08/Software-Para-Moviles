import React from 'react';
import type { Patient } from '../types';

interface PatientListProps {
  patients: Patient[];
}

export const PatientList: React.FC<PatientListProps> = ({ patients }) => {
  if (patients.length === 0) {
    return <p style={{ textAlign: 'center', color: '#777' }}>No se encontraron pacientes registrados.</p>;
  }

  return (
    <div style={styles.listContainer}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.thRow}>
            <th style={styles.cell}>Nombre</th>
            <th style={styles.cell}>Apellido</th>
            <th style={styles.cell}>CC</th>
            <th style={styles.cell}>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} style={styles.trRow}>
              <td style={styles.cell}>{p.nombre}</td>
              <td style={styles.cell}>{p.apellido}</td>
              <td style={styles.cell}>{p.cc}</td>
              <td style={styles.cell}>{p.telefono}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  thRow: {
    backgroundColor: '#0284c7',
    color: '#fff'
  },
  trRow: {
    borderBottom: '1px solid #eee'
  },
  cell: {
    padding: '12px 16px'
  }
};