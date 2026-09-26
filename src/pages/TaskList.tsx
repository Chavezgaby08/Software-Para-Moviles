import React, { useContext } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonButton, 
  IonButtons, 
  IonFab, 
  IonFabButton, 
  IonIcon, 
  IonBadge 
} from '@ionic/react';
import { add, logOut, create, trash, eye } from 'ionicons/icons';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const TaskList: React.FC = () => {
  const taskCtx = useContext(TaskContext);
  const auth = useContext(AuthContext);
  const history = useNavigate();

  const handleLogout = async () => {
    await auth?.logout();
    history('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mis Tareas</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon slot="icon-only" icon={logOut} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList>
          {taskCtx?.tasks.map((task) => (
            <IonItem key={task.id}>
              <IonLabel>
                <h2>{task.title}</h2>
                <p>{task.description}</p>
              </IonLabel>
              <IonBadge color={task.completed ? 'success' : 'warning'} slot="end">
                {task.completed ? 'Completada' : 'Pendiente'}
              </IonBadge>
              <IonButtons slot="end">
                <IonButton onClick={() => history(`/tasks/${task.id}`)}>
                  <IonIcon slot="icon-only" icon={eye} />
                </IonButton>
                <IonButton onClick={() => history(`/tasks/edit/${task.id}`)}>
                  <IonIcon slot="icon-only" icon={create} />
                </IonButton>
                <IonButton color="danger" onClick={() => taskCtx.deleteTask(task.id)}>
                  <IonIcon slot="icon-only" icon={trash} />
                </IonButton>
              </IonButtons>
            </IonItem>
          ))}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history('/tasks/new')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};