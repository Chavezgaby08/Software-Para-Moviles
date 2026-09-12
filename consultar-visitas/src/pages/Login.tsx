import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonToast,
  IonIcon
} from '@ionic/react';
import { medicalOutline, logInOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === 'medico@mediclinic.com' && password === '123456') {
      localStorage.setItem('mediclinic_doctor_logged', 'true');
      navigate('/app/visitas');
    } else {
      setShowError(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>MediClinic - Médico</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding ion-text-center">
        <IonCard style={{ maxWidth: '400px', margin: '40px auto 0 auto' }}>
          <IonCardHeader>
            <div style={{ fontSize: '60px', color: 'var(--ion-color-primary)' }}>
              <IonIcon icon={medicalOutline} />
            </div>
            <IonCardTitle>Acceso Médico</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleLogin}>
              <IonItem lines="full">
                <IonInput
                  label="Correo Electrónico"
                  labelPlacement="floating"
                  type="email"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value!)}
                  required
                />
              </IonItem>
              <IonItem lines="full">
                <IonInput
                  label="Contraseña"
                  labelPlacement="floating"
                  type="password"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value!)}
                  required
                />
              </IonItem>
              <IonButton expand="block" type="submit" className="ion-margin-top" color="primary">
                <IonIcon slot="start" icon={logInOutline} />
                Iniciar Sesión
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={showError}
          onDidDismiss={() => setShowError(false)}
          message="Credenciales incorrectas (medico@mediclinic.com / 123456)"
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;