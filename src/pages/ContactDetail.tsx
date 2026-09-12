import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonChip,
  IonAvatar
} from '@ionic/react';
import { trashOutline, callOutline, mailOutline, personOutline } from 'ionicons/icons';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Contact } from '../types/contact';

const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const contactFromState = (location.state as { contact?: Contact } | null)?.contact;
  const history = useNavigate();

  // Intenta obtener el contacto por estado o busca por id en localStorage
  const [contact] = useState<Contact | undefined>(() => {
    if (contactFromState) return contactFromState;
    const saved = localStorage.getItem('ionic_contacts');
    if (saved) {
      const contacts: Contact[] = JSON.parse(saved);
      return contacts.find((c) => c.id === id);
    }
    return undefined;
  });

  const handleDelete = () => {
    if (!contact) return;
    const saved = localStorage.getItem('ionic_contacts');
    if (saved) {
      const contacts: Contact[] = JSON.parse(saved);
      const filtered = contacts.filter((c) => c.id !== contact.id);
      localStorage.setItem('ionic_contacts', JSON.stringify(filtered));
    }
    history('/home');
  };

  if (!contact) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Detalle</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>Contacto no encontrado.</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Detalle del Contacto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <div className="ion-text-center ion-padding-top">
            <IonAvatar style={{ width: '96px', height: '96px', margin: '0 auto' }}>
              <img
                src={`https://ionicframework.com/docs/demos/api/avatar/avatar.svg`}
                alt="Avatar"
              />
            </IonAvatar>
          </div>
          <IonCardHeader className="ion-text-center">
            <IonCardTitle>{contact.name}</IonCardTitle>
            <IonCardSubtitle>
              <IonChip color="primary">
                <IonIcon icon={personOutline} />
                <IonLabel>ID: {contact.id}</IonLabel>
              </IonChip>
            </IonCardSubtitle>
          </IonCardHeader>

          <IonCardContent>
            <IonItem lines="none">
              <IonIcon icon={callOutline} slot="start" color="primary" />
              <IonLabel>
                <h3>Teléfono</h3>
                <p>{contact.phone}</p>
              </IonLabel>
            </IonItem>

            <IonItem lines="none">
              <IonIcon icon={mailOutline} slot="start" color="primary" />
              <IonLabel>
                <h3>Correo Electrónico</h3>
                <p>{contact.email || 'No asignado'}</p>
              </IonLabel>
            </IonItem>

            <IonButton
              expand="block"
              color="danger"
              className="ion-margin-top"
              onClick={handleDelete}
            >
              <IonIcon slot="start" icon={trashOutline} />
              Eliminar Contacto
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ContactDetail;