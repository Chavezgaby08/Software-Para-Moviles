import React, { useState, useContext, useEffect } from 'react';
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
  IonToast,
  IonSpinner 
} from '@ionic/react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const auth = useContext(AuthContext);
  const history = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.loading && auth.user) {
      history('/tasks', { replace: true });
    }
  }, [auth.loading, auth.user, history]);

  const handleRegister = async () => {
    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos');
      return;
    }
    setIsSubmitting(true);
    try {
      await auth.register(email, password);
      history('/tasks', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Error al registrar usuario');
      }
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Contraseña</IonLabel>
          <IonInput 
            type="password" 
            value={password} 
            onIonInput={(e) => setPassword(e.detail.value!)} 
            disabled={isSubmitting}
          />
        </IonItem>

        <IonButton expand="block" color="success" className="ion-margin-top" onClick={handleRegister} disabled={isSubmitting}>
          {isSubmitting ? <IonSpinner name="crescent" color="light" /> : 'Registrarse'}
        </IonButton>

        <IonButton expand="block" fill="clear" onClick={() => history('/login')} disabled={isSubmitting}>
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