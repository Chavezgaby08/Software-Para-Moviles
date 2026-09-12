import React, { useState, useEffect } from 'react';
import type { Patient } from './types';
import { Login } from './components/Login';
import { PatientForm } from './components/PatientForm';
import { SearchBar } from './components/SearchBar';
import { PatientList } from './components/PatientList';

const INITIAL_PATIENTS: Patient[] = [
  { id: '1', nombre: 'Carlos', apellido: 'Mendoza', cc: '1098765432', telefono: '3001234567' },
  { id: '2', nombre: 'María', apellido: 'Rodríguez', cc: '1012345678', telefono: '3109876543' },
  { id: '3', nombre: 'Andrés', apellido: 'Gómez', cc: '1055555555', telefono: '3205555555' }
];

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Recuperar sesión y pacientes de localStorage al iniciar
  useEffect(() => {
    const isLogged = localStorage.getItem('pwa_mediclinic_logged') === 'true';
    setIsAuthenticated(isLogged);

    const savedPatients = localStorage.getItem('pwa_mediclinic_patients');
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients));
    } else {
      setPatients(INITIAL_PATIENTS);
      localStorage.setItem('pwa_mediclinic_patients', JSON.stringify(INITIAL_PATIENTS));
    }
  }, []);

  // 2. Agregar paciente y guardar en localStorage
  const handleAddPatient = (newPatient: Patient) => {
    const updated = [...patients, newPatient];
    setPatients(updated);
    localStorage.setItem('pwa_mediclinic_patients', JSON.stringify(updated));
  };

  // 3. Cerrar Sesión
  const handleLogout = () => {
    localStorage.removeItem('pwa_mediclinic_logged');
    setIsAuthenticated(false);
  };

  // 4. Filtrado en el componente padre por nombre, apellido o CC
  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(term) ||
      p.apellido.toLowerCase().includes(term) ||
      p.cc.includes(term)
    );
  });

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h2>MediClinic PWA - Gestión de Pacientes</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Cerrar Sesión
        </button>
      </header>

      <main style={styles.mainContent}>
        <PatientForm onAddPatient={handleAddPatient} />

        <div style={styles.section}>
          <h3>Listado de Pacientes</h3>
          {/* El estado del buscador vive en el padre (App) */}
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          {/* La lista filtrada se envía al componente hijo */}
          <PatientList patients={filteredPatients} />
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    backgroundColor: '#0284c7',
    color: '#fff',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  mainContent: {
    maxWidth: '900px',
    margin: '30px auto',
    padding: '0 20px'
  },
  section: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  }
};

export default App;