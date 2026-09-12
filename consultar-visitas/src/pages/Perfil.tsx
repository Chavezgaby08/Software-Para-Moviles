import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonAvatar
} from '@ionic/react';
import { personCircleOutline, logOutOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';

const Perfil: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('mediclinic_doctor_logged');
    navigate('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <IonIcon icon={personCircleOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Perfil Médico
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard className="ion-text-center">
          <div className="ion-padding-top">
            <IonAvatar style={{ width: '96px', height: '96px', margin: '0 auto' }}>
              <img src="https://ionicframework.com/docs/demos/api/avatar/avatar.svg" alt="medico" />
            </IonAvatar>
          </div>
          <IonCardHeader>
            <IonCardTitle>Dr. Alejandro Ramírez</IonCardTitle>
            <IonCardSubtitle>Medicina General</IonCardSubtitle>
          </IonCardHeader>

          <IonCardContent>
            <p style={{ marginBottom: '16px' }}>
              <strong>Correo:</strong> medico@mediclinic.com
            </p>
            <IonButton expand="block" color="danger" onClick={handleLogout}>
              <IonIcon slot="start" icon={logOutOutline} />
              Cerrar Sesión
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Perfil;