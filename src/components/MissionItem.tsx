import React from 'react';
import { IonItem, IonLabel, IonBadge, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, lockClosedOutline } from 'ionicons/icons';
import { Mission } from '../types';

interface Props {
  mission: Mission;
  isActive?: boolean;
  onExecute: (mission: Mission) => void;
}

export const MissionItem: React.FC<Props> = ({ mission, isActive, onExecute }) => {
  return (
    <IonItem lines="full">
      <IonLabel className="ion-text-wrap">
        <h2>{mission.title}</h2>
        <p>{mission.description}</p>
        <div style={{ marginTop: '6px' }}>
          <IonBadge color={mission.completed ? "success" : isActive ? "primary" : mission.unlocked ? "warning" : "medium"}>
            {mission.completed ? "Completada" : isActive ? "En Curso..." : mission.unlocked ? "Pendiente" : "Bloqueada"} - {mission.points} Pts
          </IonBadge>
        </div>
      </IonLabel>
      {mission.completed ? (
        <IonIcon icon={checkmarkCircleOutline} color="success" slot="end" size="large" />
      ) : isActive ? (
        <IonButton slot="end" color="primary" fill="outline" size="small">
          Rastreando...
        </IonButton>
      ) : mission.unlocked ? (
        <IonButton slot="end" color="primary" onClick={() => onExecute(mission)}>
          Iniciar
        </IonButton>
      ) : (
        <IonIcon icon={lockClosedOutline} color="medium" slot="end" size="large" />
      )}
    </IonItem>
  );
};