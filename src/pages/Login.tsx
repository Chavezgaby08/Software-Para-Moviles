import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonItem, IonLabel, IonText } from '@ionic/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/missions');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2>Iniciar Sesión</h2>
        {error && <IonText color="danger"><p>{error}</p></IonText>}
        <IonItem>
          <IonLabel position="floating">Correo</IonLabel>
          <IonInput value={email} onIonChange={e => setEmail(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Contraseña</IonLabel>
          <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} />
        </IonItem>
        <IonButton expand="block" className="ion-margin-top" onClick={handleLogin}>Ingresar</IonButton>
        <IonButton expand="block" fill="clear" onClick={() => navigate('/register')}>¿No tienes cuenta? Regístrate</IonButton>
      </IonContent>
    </IonPage>
  );
};