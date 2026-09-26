import React, { useState, useContext } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonToast 
} from '@ionic/react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const auth = useContext(AuthContext);
  const history = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    try {
      await auth.register(email, password);
      history('/tasks', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="success">
          <IonTitle>Crear Cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Correo Electrónico</IonLabel>
          <IonInput 
            type="email" 
            value={email} 
            onIonInput={(e) => setEmail(e.detail.value!)} 
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Contraseña</IonLabel>
          <IonInput 
            type="password" 
            value={password} 
            onIonInput={(e) => setPassword(e.detail.value!)} 
          />
        </IonItem>

        <IonButton expand="block" color="success" className="ion-margin-top" onClick={handleRegister}>
          Registrarse
        </IonButton>

        <IonButton expand="block" fill="clear" onClick={() => history('/login')}>
          ¿Ya tienes cuenta? Inicia Sesión
        </IonButton>

        <IonToast
          isOpen={!!errorMsg}
          message={errorMsg}
          duration={3000}
          onDidDismiss={() => setErrorMsg('')}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};