import React, { useState, useEffect } from "react";
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, IonList, IonIcon, IonText 
} from "@ionic/react";
import { trashOutline, wifiOutline, cloudOfflineOutline } from "ionicons/icons";
import useCollection from "../hooks/useCollection";
import useNetwork from "../hooks/useNetwork";

export const ContactsPage: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const { results, isPending, getAll, add, remove } = useCollection("contactos");
  const { isOnline } = useNetwork();

  useEffect(() => {
    if (isOnline) {
      getAll();
    }
  }, [isOnline]);

  const handleAgregar = async () => {
    if (!nombre.trim() || !telefono.trim() || !isOnline) return;
    await add({ nombre, telefono });
    setNombre("");
    setTelefono("");
    await getAll();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color={isOnline ? "primary" : "medium"}>
          <IonTitle>Contactos (Firestore)</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {!isOnline && (
          <IonText color="danger">
            <p className="ion-text-center">
              <IonIcon icon={cloudOfflineOutline} /> Sin conexión a internet. Acciones de contactos deshabilitadas.
            </p>
          </IonText>
        )}

        <IonItem>
          <IonLabel position="floating">Nombre</IonLabel>
          <IonInput value={nombre} disabled={!isOnline} onIonInput={(e) => setNombre(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Teléfono</IonLabel>
          <IonInput value={telefono} disabled={!isOnline} onIonInput={(e) => setTelefono(e.detail.value!)} />
        </IonItem>

        <IonButton expand="block" className="ion-margin-top" onClick={handleAgregar} disabled={!isOnline || isPending}>
          Guardar Contacto
        </IonButton>

        <IonList className="ion-margin-top">
          {results.map((item) => (
            <IonItem key={item.id}>
              <IonLabel>
                <h2>{item.nombre}</h2>
                <p>{item.telefono}</p>
              </IonLabel>
              <IonButton 
                fill="clear" 
                color="danger" 
                slot="end" 
                disabled={!isOnline} 
                onClick={async () => {
                  await remove(item.id);
                  await getAll();
                }}
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};