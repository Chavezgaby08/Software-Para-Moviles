import React, { useContext } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonBackButton, 
  IonButtons, 
  IonBadge 
} from '@ionic/react';
import { TaskContext } from '../context/TaskContext';
import { useParams } from 'react-router-dom';

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const taskCtx = useContext(TaskContext);
  
  const task = id ? taskCtx?.getTaskById(id) : undefined;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tasks" />
          </IonButtons>
          <IonTitle>Detalle de Tarea</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {task ? (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{task.title}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p><strong>Descripción:</strong> {task.description}</p>
              <p className="ion-margin-top">
                <strong>Estado: </strong>
                <IonBadge color={task.completed ? 'success' : 'warning'}>
                  {task.completed ? 'Completada' : 'Pendiente'}
                </IonBadge>
              </p>
            </IonCardContent>
          </IonCard>
        ) : (
          <p>Tarea no encontrada.</p>
        )}
      </IonContent>
    </IonPage>
  );
};