import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonToast,
  IonIcon
} from '@ionic/react';
import { logInOutline, lockClosedOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (email.trim() === 'user@mail.com' && password === '123') {
            localStorage.setItem('logged', 'true');

            navigate('/home');
        } else {
            setShowError(true);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                <IonTitle>Inicio de sesión</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding ion-text-center">
                <IonCard style = {{ maxWidth: '400px', width: '100%', margin: '40px 0 auto'}}>
                    <IonCardHeader>
                        <div style = {{ fontSize: '48px', color: 'var(--ion-color-primary)', display: 'flex', justifyContent: 'center', minHeight: '100%', alignItems: 'center'}}>
                            <IonIcon icon = {lockClosedOutline} />
                        </div>
                    </IonCardHeader>

                    <IonCardContent>
                        <form onSubmit={handleLogin}>
                            <IonItem>
                                <IonInput
                                    label = "Correo Electrónico"
                                    labelPlacement = "floating"
                                    type = "email"
                                    placeholder = "user@mail.com"
                                    value = {email}
                                    onIonInput = { (e) => setEmail(e.detail.value!)}
                                    required/>
                            </IonItem>

                            <IonItem>
                                <IonInput
                                    label = "Contraseña"
                                    labelPlacement = "floating"
                                    type = "password"
                                    placeholder = "123"
                                    value = {password}
                                    onIonInput = { (e) => setPassword(e.detail.value!)}
                                    required/>
                            </IonItem>

                            <IonButton expand="block" type="submit" className='ion-margin-top'>
                                <IonIcon slot = 'start' icon = {logInOutline} />
                                Iniciar Sesión
                            </IonButton>
                        </form>
                    </IonCardContent>
                </IonCard>

                <IonToast
                    isOpen={showError}
                    onDidDismiss={() => setShowError(false)}
                    message="Credenciales incorrectas. (user@mail.com / 123)"
                    duration={3000}
                    color="danger"
                />
            </IonContent>
        </IonPage>
    );
};

export default Login;