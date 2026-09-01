import React from 'react';
import type{ Contact } from '../Types/contact';

interface ContactItemProps {
  contacto: Contact;
  onDelete: (id: number) => void;
  onEdit: (contacto: Contact) => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ contacto, onDelete, onEdit }) => {
  return (
    <li>
      <span>
        {contacto.nombre} - {contacto.telefono}
      </span>
      <button onClick={() => onEdit(contacto)}>Editar</button>
      <button onClick={() => onDelete(contacto.id)}>Eliminar</button>
    </li>
  );
};

export default ContactItem;