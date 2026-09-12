import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/react';
import { personAddOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router';
import { Contact } from '../types/contact';

const AddContact: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const history = useNavigate();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const saved = localStorage.getItem('ionic_contacts');
    const contacts: Contact[] = saved ? JSON.parse(saved) : [];

    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      phone,
      email: email.trim() || 'No registrado'
    };

    const updatedContacts = [...contacts, newContact];
    localStorage.setItem('ionic_contacts', JSON.stringify(updatedContacts));

    history('/home');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Crear Contacto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <form onSubmit={handleSave}>
              <IonItem>
                <IonInput
                  label="Nombre completo"
                  labelPlacement="floating"
                  value={name}
                  onIonInput={(e) => setName(e.detail.value!)}
                  required
                />
              </IonItem>

              <IonItem>
                <IonInput
                  label="Teléfono"
                  labelPlacement="floating"
                  type="tel"
                  value={phone}
                  onIonInput={(e) => setPhone(e.detail.value!)}
                  required
                />
              </IonItem>

              <IonItem>
                <IonInput
                  label="Correo Electrónico"
                  labelPlacement="floating"
                  type="email"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value!)}
                />
              </IonItem>

              <IonButton expand="block" type="submit" className="ion-margin-top">
                <IonIcon slot="start" icon={personAddOutline} />
                Guardar Contacto
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AddContact;