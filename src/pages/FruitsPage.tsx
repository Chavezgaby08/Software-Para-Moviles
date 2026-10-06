import React, { useState } from "react";
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, IonList, IonIcon, IonBadge 
} from "@ionic/react";
import { trashOutline, nutritionOutline } from "ionicons/icons";
import useDexie from "../hooks/useDexie";

export const FruitsPage: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const { results, isPending, add, deleteItem } = useDexie();

  const handleAgregar = async () => {
    if (!nombre.trim()) return;
    await add({ nombre });
    setNombre("");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="tertiary">
          <IonTitle>Frutas (Dexie / Offline)</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Nombre de la fruta</IonLabel>
          <IonInput value={nombre} onIonInput={(e) => setNombre(e.detail.value!)} />
        </IonItem>

        <IonButton expand="block" color="tertiary" className="ion-margin-top" onClick={handleAgregar} disabled={isPending}>
          Guardar Fruta Localmente
        </IonButton>

        <IonList className="ion-margin-top">
          {results.map((item) => (
            <IonItem key={item.id}>
              <IonIcon icon={nutritionOutline} slot="start" />
              <IonLabel>{item.nombre}</IonLabel>
              <IonBadge color="light" slot="end">Local</IonBadge>
              <IonButton fill="clear" color="danger" slot="end" onClick={() => item.id && deleteItem(item.id)}>
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};