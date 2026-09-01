import React, { useState, useEffect } from 'react';
import type { Contact } from './Types/contact';
import Loader from './Components/Loader';
import ContactForm from './Components/ContactForm';
import ContactList from './Components/ContactList';
import contactIcon from './assets/contact-app-icon.png';
import './App.css';

const App: React.FC = () => {
  const [contactos, setContactos] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Simulación de carga inicial de datos (2 segundos)
  useEffect(() => {
    const timer = setTimeout(() => {
      setContactos([
        { id: 1, nombre: 'Gabriela Chavez', telefono: '300 818 2441' },
        { id: 2, nombre: 'Santiago Chavez', telefono: '317 772 5708' },
      ]);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup function
  }, []);

  // Guardar (Agregar o Editar)
  const handleSaveContact = (contacto: Contact) => {
    if (editingContact) {
      setContactos((prev) =>
        prev.map((c) => (c.id === contacto.id ? contacto : c))
      );
      setEditingContact(null);
    } else {
      setContactos((prev) => [...prev, contacto]);
    }
  };

  // Eliminar
  const handleDeleteContact = (id: number) => {
    setContactos((prev) => prev.filter((c) => c.id !== id));
  };

  // Seleccionar para editar
  const handleEditContact = (contacto: Contact) => {
    setEditingContact(contacto);
  };

  return (
    <main>
      <div style={{textAlign: 'center'}}>
        <img src={contactIcon} alt='Logo App' style={{ width: '60px', height: '60px' }} />
        <h1>Gestión de Contactos</h1>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <>
          <ContactForm
            onSaveContact={handleSaveContact}
            editingContact={editingContact}
            onCancelEdit={() => setEditingContact(null)}
          />
          <h3>Lista de Contactos</h3>
          <ContactList
            contactos={contactos}
            onDelete={handleDeleteContact}
            onEdit={handleEditContact}
          />
        </>
      )}
    </main>
  );
};

export default App;