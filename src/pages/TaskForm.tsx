import React, { useState, useContext, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonTextarea, 
  IonButton, 
  IonBackButton, 
  IonButtons 
} from '@ionic/react';
import { TaskContext } from '../context/TaskContext';
import { useNavigate, useParams } from 'react-router-dom';

export const TaskForm: React.FC = () => {
  const taskCtx = useContext(TaskContext);
  const history = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (id && taskCtx) {
      const task = taskCtx.getTaskById(id);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
      }
    }
  }, [id, taskCtx]);

  const handleSave = () => {
    if (id) {
      taskCtx?.updateTask(id, { title, description });
    } else {
      taskCtx?.addTask(title, description);
    }
    history('/tasks');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tasks" />
          </IonButtons>
          <IonTitle>{id ? 'Editar Tarea' : 'Nueva Tarea'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Título</IonLabel>
          <IonInput 
            value={title} 
            onIonInput={(e) => setTitle(e.detail.value!)} 
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Descripción</IonLabel>
          <IonTextarea 
            value={description} 
            onIonInput={(e) => setDescription(e.detail.value!)} 
          />
        </IonItem>

        <IonButton expand="block" className="ion-margin-top" onClick={handleSave}>
          {id ? 'Guardar Cambios' : 'Crear Tarea'}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};