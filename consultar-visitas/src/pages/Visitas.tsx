import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
  useIonViewWillEnter
} from '@ionic/react';
import { calendarOutline, timeOutline, chevronForward } from 'ionicons/icons';
import { Visita } from '../types';

const INITIAL_VISITAS: Visita[] = [
  { id: '1', paciente: 'Carlos Mendoza', hora: '08:00 AM', estado: 'pendiente', direccion: 'Calle 10 # 5-20', motivo: 'Control Postoperatorio' },
  { id: '2', paciente: 'María Rodríguez', hora: '10:30 AM', estado: 'en_camino', direccion: 'Carrera 15 # 40-12', motivo: 'Revisión General' },
  { id: '3', paciente: 'Andrés Gómez', hora: '02:00 PM', estado: 'finalizada', direccion: 'Av. Siempre Viva 742', motivo: 'Chequeo de Presión' }
];

const Visitas: React.FC = () => {
  const [visitas, setVisitas] = useState<Visita[]>([]);

  useIonViewWillEnter(() => {
    const saved = localStorage.getItem('mediclinic_visitas');
    if (saved) {
      setVisitas(JSON.parse(saved));
    } else {
      setVisitas(INITIAL_VISITAS);
      localStorage.setItem('mediclinic_visitas', JSON.stringify(INITIAL_VISITAS));
    }
  });

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_camino': return 'secondary';
      case 'finalizada': return 'success';
      default: return 'medium';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <IonIcon icon={calendarOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Visitas del Día
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList lines="full">
          {visitas.map((v) => (
            <IonItem key={v.id} button routerLink={`/app/visitas/${v.id}`}>
              <IonLabel>
                <h2>{v.paciente}</h2>
                <p>
                  <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {v.hora}
                </p>
              </IonLabel>
              <IonBadge color={getBadgeColor(v.estado)} slot="end">
                {v.estado.replace('_', ' ')}
              </IonBadge>
              <IonIcon icon={chevronForward} slot="end" color="medium" />
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Visitas;