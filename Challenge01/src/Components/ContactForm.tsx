import React, { useState, useEffect } from 'react';
import type { Contact } from '../Types/contact';

interface ContactFormProps {
  onSaveContact: (contact: Contact) => void;
  editingContact: Contact | null;
  onCancelEdit: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  onSaveContact,
  editingContact,
  onCancelEdit,
}) => {
  const [nombre, setNombre] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');

  useEffect(() => {
    if (editingContact) {
      setNombre(editingContact.nombre);
      setTelefono(editingContact.telefono);
    } else {
      setNombre('');
      setTelefono('');
    }
  }, [editingContact]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) return;

    onSaveContact({
      id: editingContact ? editingContact.id : Date.now(),
      nombre,
      telefono,
    });

    setNombre('');
    setTelefono('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{editingContact ? 'Editar Contacto' : 'Agregar Contacto'}</h3>
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelefono(e.target.value)}
      />
      <button type="submit">{editingContact ? 'Guardar Cambios' : 'Agregar'}</button>
      {editingContact && (
        <button type="button" onClick={onCancelEdit}>
          Cancelar
        </button>
      )}
    </form>
  );
};

export default ContactForm;