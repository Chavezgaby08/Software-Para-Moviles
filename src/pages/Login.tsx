import React, { useState } from "react";
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, IonText, IonIcon 
} from "@ionic/react";
import { logInOutline } from "ionicons/icons";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isPending } = useAuthContext();
  const history = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return;
    const user = await login(email, password);
    if (user) {
      history("/app/contacts");
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
          <IonLabel position="floating">Correo electrónico</IonLabel>
          <IonInput type="email" value={email} onIonInput={(e) => setEmail(e.detail.value!)} />
        </IonItem>

        <IonItem className="ion-margin-top">
          <IonLabel position="floating">Contraseña</IonLabel>
          <IonInput type="password" value={password} onIonInput={(e) => setPassword(e.detail.value!)} />
        </IonItem>

        {error && (
          <IonText color="danger" className="ion-margin-top">
            <p className="ion-padding-start">{error}</p>
          </IonText>
        )}

        <IonButton expand="block" className="ion-margin-top" onClick={handleLogin} disabled={isPending}>
          <IonIcon slot="start" icon={logInOutline} />
          Ingresar
        </IonButton>

        <IonButton expand="block" fill="clear" className="ion-margin-top" onClick={() => history("/register")}>
          ¿No tienes cuenta? Regístrate
        </IonButton>
      </IonContent>
    </IonPage>
  );
};