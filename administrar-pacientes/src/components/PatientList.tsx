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
    <div className="patient-list-container" style={styles.listContainer}>
      <div className="patient-cards" aria-label="Pacientes registrados" style={{textAlign: 'center'}}>
        {patients.map((p) => (
          <article className="patient-card" key={p.id}>
            <h4>{p.nombre} {p.apellido}</h4>
            <dl>
              <div>
                <dt>CC</dt>
                <dd>{p.cc}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{p.telefono}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
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