import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonToast,
  useIonViewWillEnter
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { Visita } from '../types';

const VisitaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [visita, setVisita] = useState<Visita | null>(null);
  const [showToast, setShowToast] = useState(false);

  useIonViewWillEnter(() => {
    const saved = localStorage.getItem('mediclinic_visitas');
    if (saved) {
      const list: Visita[] = JSON.parse(saved);
      const found = list.find((v) => v.id === id);
      if (found) setVisita(found);
    }
  });

  const handleEstadoChange = (newEstado: 'pendiente' | 'en_camino' | 'finalizada') => {
    if (!visita) return;
    const updated = { ...visita, estado: newEstado };
    setVisita(updated);

    const saved = localStorage.getItem('mediclinic_visitas');
    if (saved) {
      const list: Visita[] = JSON.parse(saved);
      const updatedList = list.map((v) => (v.id === id ? updated : v));
      localStorage.setItem('mediclinic_visitas', JSON.stringify(updatedList));
      setShowToast(true);
    }
  };

  if (!visita) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/app/visitas" />
            </IonButtons>
            <IonTitle>Detalle</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">Cargando información...</IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/visitas" />
          </IonButtons>
          <IonTitle>Detalle de Visita</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{visita.paciente}</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonItem lines="none">
              <IonLabel>
                <h3>Hora programada</h3>
                <p>{visita.hora}</p>
              </IonLabel>
            </IonItem>

            <IonItem lines="none">
              <IonLabel>
                <h3>Dirección</h3>
                <p>{visita.direccion || 'No registrada'}</p>
              </IonLabel>
            </IonItem>

            <IonItem lines="none">
              <IonLabel>
                <h3>Motivo de consulta</h3>
                <p>{visita.motivo || 'No especificado'}</p>
              </IonLabel>
            </IonItem>

            <IonItem lines="full" className="ion-margin-top">
              <IonSelect
                label="Estado de la Visita"
                labelPlacement="floating"
                value={visita.estado}
                onIonChange={(e) => handleEstadoChange(e.detail.value)}
              >
                <IonSelectOption value="pendiente">Pendiente</IonSelectOption>
                <IonSelectOption value="en_camino">En Camino</IonSelectOption>
                <IonSelectOption value="finalizada">Finalizada</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Estado actualizado correctamente"
          duration={2000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default VisitaDetalle;