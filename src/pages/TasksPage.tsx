import React, { useState } from "react";
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, IonList, IonIcon, IonText 
} from "@ionic/react";
import { trashOutline, cloudOfflineOutline } from "ionicons/icons";
import useRealTimeCollection from "../hooks/useRealTimeCollection";
import useNetwork from "../hooks/useNetwork";

export const TasksPage: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const { results, isPending, add, deleteDoc } = useRealTimeCollection("tareas");
  const { isOnline } = useNetwork();

  const handleAgregar = async () => {
    if (!titulo.trim() || !isOnline) return;
    await add({ titulo });
    setTitulo("");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color={isOnline ? "secondary" : "medium"}>
          <IonTitle>Tareas (RealTime)</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {!isOnline && (
          <IonText color="danger">
            <p className="ion-text-center">
              <IonIcon icon={cloudOfflineOutline} /> Sin conexión. Las tareas en tiempo real están deshabilitadas.
            </p>
          </IonText>
        )}

        <IonItem>
          <IonLabel position="floating">Título de la Tarea</IonLabel>
          <IonInput value={titulo} disabled={!isOnline} onIonInput={(e) => setTitulo(e.detail.value!)} />
        </IonItem>

        <IonButton expand="block" color="secondary" className="ion-margin-top" onClick={handleAgregar} disabled={!isOnline || isPending}>
          Crear Tarea
        </IonButton>

        <IonList className="ion-margin-top">
          {results.map((item) => (
            <IonItem key={item.id}>
              <IonLabel>{item.titulo}</IonLabel>
              <IonButton 
                fill="clear" 
                color="danger" 
                slot="end" 
                disabled={!isOnline} 
                onClick={() => deleteDoc(item.id)}
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