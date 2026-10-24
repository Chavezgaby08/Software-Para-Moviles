import React from 'react';
import { IonItem, IonLabel, IonBadge, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, lockClosedOutline } from 'ionicons/icons';
import { Mission } from '../types';

interface Props {
  mission: Mission;
  onExecute: (mission: Mission) => void;
}

export const MissionItem: React.FC<Props> = ({ mission, onExecute }) => {
  return (
    <IonItem>
      <IonLabel className="ion-text-wrap">
        <h2>{mission.title}</h2>
        <p>{mission.description}</p>
        <IonBadge color={mission.completed ? "success" : mission.unlocked ? "warning" : "medium"}>
          {mission.completed ? "Completada" : mission.unlocked ? "Disponible" : "Bloqueada"} - {mission.points} Pts
        </IonBadge>
      </IonLabel>
      {mission.completed ? (
        <IonIcon icon={checkmarkCircleOutline} color="success" slot="end" size="large" />
      ) : mission.unlocked ? (
        <IonButton slot="end" onClick={() => onExecute(mission)}>Iniciar</IonButton>
      ) : (
        <IonIcon icon={lockClosedOutline} color="medium" slot="end" size="large" />
      )}
    </IonItem>
  );
};