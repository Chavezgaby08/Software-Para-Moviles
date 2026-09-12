import React from 'react';
import { IonList, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/react';
import { trashOutline, createOutline } from 'ionicons/icons';

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface ContactListProps {
  contacts: Contact[];
  onDeleteContact: (id: string) => void;
  onEditContact: (contact: Contact) => void;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onDeleteContact, onEditContact }) => {
  if (contacts.length === 0) {
    return (
      <IonItem>
        <IonLabel className="ion-text-center">No hay contactos guardados</IonLabel>
      </IonItem>
    );
  }

  return (
    <IonList lines="full">
      {contacts.map((contact) => (
        <IonItem key={contact.id}>
          <IonLabel>
            <h2>{contact.name}</h2>
            <p>{contact.phone}</p>
          </IonLabel>
          <IonButton 
            slot="end" 
            fill="clear" 
            onClick={() => onEditContact(contact)}
          >
            <IonIcon icon={createOutline} />
          </IonButton>
          <IonButton 
            slot="end" 
            color="danger" 
            fill="clear" 
            onClick={() => onDeleteContact(contact.id)}
          >
            <IonIcon icon={trashOutline} />
          </IonButton>
        </IonItem>
      ))}
    </IonList>
  );
};

export default ContactList;