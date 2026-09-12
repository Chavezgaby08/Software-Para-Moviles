import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonIcon,
  IonItem,
  IonLabel
} from '@ionic/react';
import { checkboxOutline } from 'ionicons/icons';
import TaskForm from '../components/TaskForm';
import TaskItem, { Task } from '../components/TaskItem';

const Home: React.FC = () => {
  // Estado para la lista de tareas con persistencia inicial (useState + useEffect)
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('ionic_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: '1', text: 'Revisar diapositivas de Ionic', completed: true },
      { id: '2', text: 'Crear componentes de React', completed: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem('ionic_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <IonIcon icon={checkboxOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Task Manager
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <TaskForm onAddTask={handleAddTask} />

        <IonList lines="full">
          {tasks.length === 0 ? (
            <IonItem>
              <IonLabel className="ion-text-center">No hay tareas pendientes</IonLabel>
            </IonItem>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
              />
            ))
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;