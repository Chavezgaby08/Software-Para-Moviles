import React from 'react';
import { IonItem, IonLabel, IonCheckbox, IonButton, IonIcon } from '@ionic/react';
import { trashOutline } from 'ionicons/icons';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDeleteTask }) => {
  return (
    <IonItem key={task.id}>
      <IonCheckbox
        slot="start"
        checked={task.completed}
        onIonChange={() => onToggleComplete(task.id)}
      />
      <IonLabel 
        style={{ 
          textDecoration: task.completed ? 'line-through' : 'none',
          color: task.completed ? 'var(--ion-color-medium)' : 'inherit'
        }}
      >
        {task.text}
      </IonLabel>
      <IonButton
        slot="end"
        color="danger"
        fill="clear"
        onClick={() => onDeleteTask(task.id)}
      >
        <IonIcon icon={trashOutline} />
      </IonButton>
    </IonItem>
  );
};

export default TaskItem;