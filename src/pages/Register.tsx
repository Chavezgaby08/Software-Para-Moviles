import React, { useState } from "react";
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, IonText, IonIcon 
} from "@ionic/react";
import { personAddOutline } from "ionicons/icons";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, error, isPending } = useAuthContext();
  const history = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) return;
    const user = await register(email, password);
    if (user) {
      history("/app/contacts");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Registro de Usuario</IonTitle>
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

        <IonButton expand="block" className="ion-margin-top" onClick={handleRegister} disabled={isPending}>
          <IonIcon slot="start" icon={personAddOutline} />
          Registrarse
        </IonButton>

        <IonButton expand="block" fill="clear" className="ion-margin-top" onClick={() => history("/login")}>
          ¿Ya tienes cuenta? Inicia sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
};