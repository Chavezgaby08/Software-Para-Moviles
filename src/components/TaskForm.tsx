import React, { useState} from "react";
import { IonItem, IonInput, IonButton, IonIcon } from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';

interface TaskFormProps {
    onAddTask: (task: string) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
    const [taskText, setTaskText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskText.trim()) return;

        onAddTask(taskText);
        setTaskText('');
    };

    return (
        <form onSubmit = {handleSubmit} className="ion-padding-bottom">
            <IonItem>
                <IonInput
                    label = "Nueva Tarea"
                    labelPlacement = "floating"
                    placeholder = "Ej. Estudiar para el parcial de IA para móviles y embebidos"
                    value = {taskText}
                    onIonInput = {(e) => setTaskText(e.detail.value!)}
                />
            </IonItem>
            <IonButton expand = "block" type = "submit" className = "ion-margin-top">
                <IonIcon icon = {addCircleOutline} slot = "start" />
                Agregar Tarea
            </IonButton>
        </form>
    );
};

export default TaskForm;