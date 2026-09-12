import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonIcon,
  IonModal,
  IonButton,
  IonButtons,
  IonItem,
  IonInput
} from '@ionic/react';
import { peopleOutline } from 'ionicons/icons';
import ContactForm from '../components/ContactForm';
import ContactList, { Contact } from '../components/ContactList';

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'John Doe', phone: '123-456-7890' },
  { id: '2', name: 'Jane Smith', phone: '987-654-3210' },
  { id: '3', name: 'Alice Johnson', phone: '555-555-5555' },
];

const Home: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('ionic_contacts');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    return MOCK_CONTACTS;
  });

  // Estado para la edición
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    localStorage.setItem('ionic_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleAddContact = (name: string, phone: string) => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      phone,
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleOpenEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setEditName(contact.name);
    setEditPhone(contact.phone);
  };

  const handleSaveEdit = () => {
    if (!editingContact || !editName.trim() || !editPhone.trim()) return;

    setContacts((prev) =>
      prev.map((c) =>
        c.id === editingContact.id ? { ...c, name: editName, phone: editPhone } : c
      )
    );
    setEditingContact(null);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <IonIcon icon={peopleOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Lista de contactos
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <ContactForm onAddContact={handleAddContact} />
        <ContactList 
          contacts={contacts} 
          onDeleteContact={handleDeleteContact} 
          onEditContact={handleOpenEditModal}
        />

        {/* Modal de edición */}
        <IonModal isOpen={editingContact !== null} onDidDismiss={() => setEditingContact(null)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Contacto</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setEditingContact(null)}>Cancelar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonInput
                label="Nombre"
                labelPlacement="floating"
                value={editName}
                onIonInput={(e) => setEditName(e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Teléfono"
                labelPlacement="floating"
                type="tel"
                value={editPhone}
                onIonInput={(e) => setEditPhone(e.detail.value!)}
              />
            </IonItem>
            <IonButton expand="block" className="ion-margin-top" onClick={handleSaveEdit}>
              Guardar Cambios
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;