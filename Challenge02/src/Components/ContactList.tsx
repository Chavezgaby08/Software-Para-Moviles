import React from 'react';
import type { Contact } from '../Types/contact';
import ContactItem from './ContactItem';

interface ContactListProps {
  contactos: Contact[];
  onDelete: (id: number) => void;
  onEdit: (contacto: Contact) => void;
}

const ContactList: React.FC<ContactListProps> = ({ contactos, onDelete, onEdit }) => {
  if (contactos.length === 0) {
    return <p>No hay contactos registrados.</p>;
  }

  return (
    <ul>
      {contactos.map((contacto) => (
        <ContactItem
          key={contacto.id}
          contacto={contacto}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
};

export default ContactList;