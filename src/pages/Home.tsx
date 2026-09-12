import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar
} from '@ionic/react';
import { logOutOutline, peopleOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // Acción para cerrar sesión (Limpiar almacenamiento y redirigir)
  const handleLogout = () => {
    localStorage.removeItem('logged');
    navigate('/login');
  };

  const contacts = [
    { id: '1', name: 'John Doe', phone: '123-456-7890' },
    { id: '2', name: 'Jane Smith', phone: '987-654-3210' },
    { id: '3', name: 'Alice Johnson', phone: '555-555-5555' }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <IonIcon icon={peopleOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Lista de Contactos
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList lines="full">
          {contacts.map((contact) => (
            <IonItem key={contact.id}>
              <IonAvatar slot="start">
                <img src="https://ionicframework.com/docs/demos/api/avatar/avatar.svg" alt="avatar" />
              </IonAvatar>
              <IonLabel>
                <h2>{contact.name}</h2>
                <p>{contact.phone}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;