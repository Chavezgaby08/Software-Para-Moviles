import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonItem, IonLabel, IonText } from '@ionic/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // Crear documento inicial en Firestore
      await setDoc(doc(db, 'users', res.user.uid), {
        email: email,
        points: 0,
        missions: []
      });
      navigate('/missions');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2>Registro de Usuario</h2>
        {error && <IonText color="danger"><p>{error}</p></IonText>}
        <IonItem>
          <IonLabel position="floating">Correo</IonLabel>
          <IonInput value={email} onIonChange={e => setEmail(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Contraseña</IonLabel>
          <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} />
        </IonItem>
        <IonButton expand="block" className="ion-margin-top" onClick={handleRegister}>Crear Cuenta</IonButton>
        <IonButton expand="block" fill="clear" onClick={() => navigate('/login')}>Volver al Login</IonButton>
      </IonContent>
    </IonPage>
  );
};