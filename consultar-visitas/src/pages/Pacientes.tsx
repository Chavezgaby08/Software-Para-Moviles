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
  IonAvatar,
  IonIcon,
  useIonViewWillEnter
} from '@ionic/react';
import { peopleOutline } from 'ionicons/icons';
import { Paciente } from '../types';

const INITIAL_PACIENTES: Paciente[] = [
  { id: '1', nombre: 'Carlos Mendoza', cc: '1098765432', telefono: '3001234567' },
  { id: '2', nombre: 'María Rodríguez', cc: '1012345678', telefono: '3109876543' },
  { id: '3', nombre: 'Andrés Gómez', cc: '1055555555', telefono: '3205555555' }
];

const Pacientes: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>(() => {
    const saved = localStorage.getItem('mediclinic_doctor_pacientes');
    return saved ? JSON.parse(saved) : INITIAL_PACIENTES;
  });

  useIonViewWillEnter(() => {
    const saved = localStorage.getItem('mediclinic_doctor_pacientes');
    if (saved) {
      setPacientes(JSON.parse(saved));
    } else {
      setPacientes(INITIAL_PACIENTES);
      localStorage.setItem('mediclinic_doctor_pacientes', JSON.stringify(INITIAL_PACIENTES));
    }
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <IonIcon icon={peopleOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Directorio de Pacientes
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList lines="full">
          {pacientes.map((p) => (
            <IonItem key={p.id}>
              <IonAvatar slot="start">
                <img src="https://ionicframework.com/docs/demos/api/avatar/avatar.svg" alt="avatar" />
              </IonAvatar>
              <IonLabel>
                <h2>{p.nombre}</h2>
                <p>CC: {p.cc}</p>
                <p>Tel: {p.telefono}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Pacientes;