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

export const Login: React.FC = () => {
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

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos');
      return;
    }
    setIsSubmitting(true);
    try {
      await auth.login(email, password);
      history('/tasks', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Error al iniciar sesión');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Iniciar Sesión</IonTitle>
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

        <IonButton expand="block" className="ion-margin-top" onClick={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? <IonSpinner name="crescent" color="light" /> : 'Ingresar'}
        </IonButton>

        <IonButton expand="block" fill="clear" onClick={() => history('/register')} disabled={isSubmitting}>
          ¿No tienes cuenta? Regístrate
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