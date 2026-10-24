import React, { useState, useEffect, useContext } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonProgressBar, IonList, IonButton, IonText, IonLoading, IonButtons } from '@ionic/react';
import { AuthContext } from '../context/AuthContext';
import { MissionItem } from '../components/MissionItem';
import { Mission } from '../types';
import { useCamera } from '../hooks/useCamera';
import { useGeolocation } from '../hooks/useGeolocation';
import { useHaptics } from '../hooks/useHaptics';
import { useLocalNotifications } from '../hooks/useLocalNotifications';
import { useAccelerometer } from '../hooks/useAccelerometer';
import { useNavigate } from 'react-router-dom';

export const MainMissions: React.FC = () => {
  const { user, logout, updateUserPoints } = useContext(AuthContext);
  const navigate = useNavigate();

  const { takePhoto } = useCamera();
  const { getCurrentPosition, calculateDistance } = useGeolocation();
  const { vibrate } = useHaptics();
  const { requestPermission, sendNotification } = useLocalNotifications();
  const { isMoving, startTracking, stopTracking } = useAccelerometer();

  const [points, setPoints] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string | null>(null);

  const [missions, setMissions] = useState<Mission[]>([
    { id: 1, title: 'Misión 1: Evidencia', description: 'Toma una foto con la cámara', points: 40, completed: false, unlocked: true },
    { id: 2, title: 'Misión 2: Movimiento real', description: 'Muévete al menos 30 metros de tu posición actual', points: 40, completed: false, unlocked: false },
    { id: 3, title: 'Misión 3: Permanencia activa', description: 'Mantente quieto durante 10 segundos continuos', points: 40, completed: false, unlocked: false }
  ]);

  useEffect(() => {
    requestPermission();
    // Cargar datos locales iniciales si existen
    const saved = localStorage.getItem('app_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPoints(parsed.points || 0);
      if (parsed.missions) {
        setMissions(prev => prev.map(m => {
          const found = parsed.missions.find((sm: any) => sm.id === m.id);
          return found ? { ...m, completed: found.completed } : m;
        }));
      }
    }
  }, []);

  const completeMission = (id: number) => {
    let updatedPoints = points;
    const updatedMissions = missions.map(m => {
      if (m.id === id && !m.completed) {
        m.completed = true;
        updatedPoints += m.points;
      }
      return m;
    });

    // Desbloquear misiones según lógica de secuencia
    if (id === 1 && updatedMissions[0].completed) updatedMissions[1].unlocked = true;
    if (id === 2 && updatedMissions[1].completed) updatedMissions[2].unlocked = true;

    setMissions(updatedMissions);
    setPoints(updatedPoints);

    // Guardar en Firebase y LocalStorage
    const jsonMissions = updatedMissions.map(m => ({ id: m.id, completed: m.completed }));
    updateUserPoints(updatedPoints, jsonMissions);

    // Notificaciones locales requeridas
    const completedCount = updatedMissions.filter(m => m.completed).length;
    sendNotification("¡Misión Completada!", "Has completado una misión.");

    if (completedCount === updatedMissions.length - 1) {
      sendNotification("¡Casi lo logras!", "Te falta 1 misión para completar.");
    }
  };

  // Misión 1: Cámara
  const handleMission1 = async () => {
    const photo = await takePhoto();
    if (photo) {
      completeMission(1);
    }
  };

  // Misión 2: Geolocalización (>30m)
  const handleMission2 = async () => {
    setLoadingText("Obteniendo posición inicial...");
    const initialCoords = await getCurrentPosition();

    setLoadingText("Camina al menos 30 metros. Verificando...");
    
    // Intervalo de verificación cada 3 segundos
    const interval = setInterval(async () => {
      const currentCoords = await getCurrentPosition();
      const distance = calculateDistance(
        initialCoords.latitude,
        initialCoords.longitude,
        currentCoords.latitude,
        currentCoords.longitude
      );

      if (distance >= 30) {
        clearInterval(interval);
        setLoadingText(null);
        completeMission(2);
      }
    }, 3000);
  };

  // Misión 3: Permanencia (10 segundos quieto con Acelerómetro)
  const handleMission3 = async () => {
    setLoadingText("Quédate totalmente quieto durante 10 segundos...");
    await startTracking();

    let secondsStill = 0;
    const timer = setInterval(() => {
      if (isMoving) {
        secondsStill = 0; // Reinicia contador si detecta movimiento brusco
      } else {
        secondsStill += 1;
      }

      if (secondsStill >= 10) {
        clearInterval(timer);
        stopTracking();
        vibrate(1000); // Pasados 10 segundos el celular vibra
        setLoadingText(null);
        completeMission(3);
      }
    }, 1000);
  };

  const executeMission = (mission: Mission) => {
    if (mission.id === 1) handleMission1();
    if (mission.id === 2) handleMission2();
    if (mission.id === 3) handleMission3();
  };

  const completedMissionsCount = missions.filter(m => m.completed).length;
  const progressPercent = completedMissionsCount / missions.length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Panel de Misiones</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={logout}>Salir</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={!!loadingText} message={loadingText || ''} />

        <div className="ion-margin-bottom">
          <h3>Puntos Totales: <strong>{points}</strong></h3>
          <IonText color="dark">
            <p>Progreso General: {completedMissionsCount} de {missions.length} misiones completadas</p>
          </IonText>
          <IonProgressBar value={progressPercent} color="success" />
        </div>

        <IonList>
          {missions.map(m => (
            <MissionItem key={m.id} mission={m} onExecute={executeMission} />
          ))}
        </IonList>

        <IonButton
          expand="block"
          color="tertiary"
          className="ion-margin-top"
          onClick={() => navigate('/results')}
        >
          Ver Resultados y Ranking
        </IonButton>
      </IonContent>
    </IonPage>
  );
};