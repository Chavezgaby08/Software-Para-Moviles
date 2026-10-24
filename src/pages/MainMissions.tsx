import React, { useState, useEffect, useContext, useRef } from 'react';
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Función para calcular el estado de desbloqueo según la secuencia de misiones
const computeUnlockedMissions = (missionsList: Mission[]): Mission[] => {
  const m1Done = !!missionsList.find(m => m.id === 1)?.completed;
  const m2Done = !!missionsList.find(m => m.id === 2)?.completed;

  return missionsList.map(m => {
    if (m.id === 1) {
      // Misión 1 siempre está disponible
      return { ...m, unlocked: true };
    }
    if (m.id === 2) {
      // Misión 2 se desbloquea si la 1 fue completada
      return { ...m, unlocked: m1Done };
    }
    if (m.id === 3) {
      // Misión 3 se desbloquea si la 2 fue completada
      return { ...m, unlocked: m2Done };
    }
    return m;
  });
};

export const MainMissions: React.FC = () => {
  const { user, logout, updateUserPoints } = useContext(AuthContext);
  const navigate = useNavigate();

  const [photo, setPhoto] = useState<string | null>(() => {
    return localStorage.getItem('mission_photo') || null;
  });
  const { takePhoto } = useCamera();
  const { getCurrentPosition, watchPosition, clearPositionWatch, calculateDistance } = useGeolocation();
  const { vibrate } = useHaptics();
  const { requestPermission, sendNotification } = useLocalNotifications();
  const { isMoving, startTracking, stopTracking } = useAccelerometer();

  const [points, setPoints] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string | null>(null);
  const [mission2Tracking, setMission2Tracking] = useState<{ distance: number; attempts: number } | null>(null);
  const [mission3Tracking, setMission3Tracking] = useState<{ remaining: number; movingDetected: boolean } | null>(null);
  const mission2WatchRef = useRef<string | null>(null);
  const mission2StartingRef = useRef(false);
  const mission2CancelledRef = useRef(false);
  const mission3TimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [missions, setMissions] = useState<Mission[]>([
    { id: 1, title: 'Misión 1: Evidencia', description: 'Toma una foto con la cámara (se completa al guardar imagen)', points: 40, completed: false, unlocked: true },
    { id: 2, title: 'Misión 2: Movimiento real', description: 'Muévete al menos 30 a 50 metros de tu posición original', points: 40, completed: false, unlocked: false },
    { id: 3, title: 'Misión 3: Permanencia activa', description: 'Mantente quieto durante 10 segundos continuos (el celular vibrará al finalizar)', points: 40, completed: false, unlocked: false }
  ]);

  const applyLoadedProgress = (
    savedPoints: number,
    savedMissions: Array<{ id: number; completed: boolean; unlocked?: boolean }>
  ) => {
    setPoints(savedPoints);
    setMissions(prev => {
      const merged = prev.map(m => {
        const found = savedMissions.find(sm => sm.id === m.id);
        return found ? { ...m, completed: found.completed } : m;
      });
      return computeUnlockedMissions(merged);
    });
  };

  useEffect(() => {
    requestPermission();

    // 1. Cargar datos locales inmediatamente para que nunca se pierda el botón Iniciar
    const saved = localStorage.getItem('app_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.points === 'number' && Array.isArray(parsed.missions)) {
          applyLoadedProgress(parsed.points, parsed.missions);
        }
      } catch (e) {
        console.warn("Error cargando app_progress local:", e);
      }
    }

    // 2. Sincronizar desde Firebase Firestore por si se reabrió la app o cambió de dispositivo
    const syncFromFirestore = async () => {
      if (!user?.uid) return;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.points === 'number' && Array.isArray(data.missions)) {
            applyLoadedProgress(data.points, data.missions);
            localStorage.setItem('app_progress', JSON.stringify({
              points: data.points,
              missions: data.missions
            }));
          }
        }
      } catch (e) {
        console.warn("Sincronización Firestore en inicio:", e);
      }
    };

    syncFromFirestore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const completeMission = (id: number) => {
    let updatedPoints = points;
    const mapped = missions.map(m => {
      if (m.id === id && !m.completed) {
        m.completed = true;
        updatedPoints += m.points;
      }
      return m;
    });

    // Desbloquear automáticamente la siguiente misión en secuencia
    const updatedMissions = computeUnlockedMissions(mapped);

    setMissions(updatedMissions);
    setPoints(updatedPoints);

    // Guardar en Firebase y LocalStorage
    const jsonMissions = updatedMissions.map(m => ({
      id: m.id,
      completed: m.completed,
      unlocked: m.unlocked
    }));
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
    setLoadingText("Abriendo cámara para captura de evidencia...");
    try {
      const capturedPhoto = await takePhoto();
      setLoadingText(null);
      if (capturedPhoto) {
        setPhoto(capturedPhoto);
        localStorage.setItem('mission_photo', capturedPhoto);
        completeMission(1);
      }
    } catch (e) {
      console.warn("Error capturando foto:", e);
      setLoadingText(null);
    }
  };


  // Misión 2: esperar actualizaciones GPS nuevas hasta alejarse 30 metros.
  const handleMission2 = async () => {
    if (mission2StartingRef.current || mission2WatchRef.current) return;
    mission2StartingRef.current = true;
    mission2CancelledRef.current = false;
    setLoadingText("Obteniendo posición inicial GPS...");
    try {
      const initialCoords = await getCurrentPosition();
      if (mission2CancelledRef.current) return;
      setLoadingText(null);
      setMission2Tracking({ distance: 0, attempts: 0 });

      let attempts = 0;
      let reachedTarget = false;
      const watchId = await watchPosition((position) => {
        if (mission2CancelledRef.current || reachedTarget) return;
        attempts++;
        const distance = calculateDistance(
          initialCoords.latitude,
          initialCoords.longitude,
          position.coords.latitude,
          position.coords.longitude
        );

        const roundedDist = Math.round(distance);
        setMission2Tracking({ distance: roundedDist, attempts });

        if (roundedDist >= 30) {
          reachedTarget = true;
          const activeWatch = mission2WatchRef.current;
          mission2WatchRef.current = null;
          if (activeWatch) void clearPositionWatch(activeWatch);
          setMission2Tracking(null);
          completeMission(2);
        }
      }, (error) => {
        console.warn("Error recibiendo actualizaciones GPS:", error);
      });
      if (mission2CancelledRef.current || reachedTarget) {
        void clearPositionWatch(watchId);
      } else {
        mission2WatchRef.current = watchId;
      }
    } catch (e) {
      console.warn("Error inicializando GPS:", e);
      setLoadingText(null);
      setMission2Tracking(null);
    } finally {
      mission2StartingRef.current = false;
    }
  };

  // Misión 3: Permanencia (10 segundos quieto con Acelerómetro)
  const handleMission3 = async () => {
    setMission3Tracking({ remaining: 10, movingDetected: false });
    try {
      await startTracking();
    } catch (e) {
      console.warn("No se pudo iniciar acelerómetro:", e);
    }

    let secondsStill = 0;
    const timer = setInterval(() => {
      if (isMoving) {
        secondsStill = 0; // Reinicia contador si detecta movimiento brusco
        setMission3Tracking({ remaining: 10, movingDetected: true });
      } else {
        secondsStill += 1;
        setMission3Tracking({ remaining: Math.max(0, 10 - secondsStill), movingDetected: false });
      }

      if (secondsStill >= 10) {
        if (mission3TimerRef.current) {
          clearInterval(mission3TimerRef.current);
          mission3TimerRef.current = null;
        }
        stopTracking();
        vibrate(1000); // Pasados 10 segundos el celular vibra
        setMission3Tracking(null);
        completeMission(3);
      }
    }, 1000);

    mission3TimerRef.current = timer;
  };

  const cancelActiveMissions = () => {
    mission2CancelledRef.current = true;
    if (mission2WatchRef.current) {
      void clearPositionWatch(mission2WatchRef.current);
      mission2WatchRef.current = null;
    }
    if (mission3TimerRef.current) {
      clearInterval(mission3TimerRef.current);
      mission3TimerRef.current = null;
      stopTracking();
    }
    setMission2Tracking(null);
    setMission3Tracking(null);
    setLoadingText(null);
  };

  const executeMission = (mission: Mission) => {
    if (mission.id === 1) handleMission1();
    if (mission.id === 2) handleMission2();
    if (mission.id === 3) handleMission3();
  };

  const simulateStepMission2 = () => {
    if (mission2WatchRef.current) {
      void clearPositionWatch(mission2WatchRef.current);
      mission2WatchRef.current = null;
    }
    setMission2Tracking(null);
    setLoadingText(null);
    completeMission(2);
  };

  const simulateStepMission3 = () => {
    if (mission3TimerRef.current) {
      clearInterval(mission3TimerRef.current);
      mission3TimerRef.current = null;
    }
    stopTracking();
    vibrate(1000);
    setMission3Tracking(null);
    completeMission(3);
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
        <IonLoading
          isOpen={!!loadingText}
          message={loadingText || ''}
          backdropDismiss={true}
          onDidDismiss={() => cancelActiveMissions()}
        />

        {user?.email && (
          <div style={{ marginBottom: '8px' }}>
            <IonText color="medium">
              <small>Usuario activo: <strong>{user.email}</strong></small>
            </IonText>
          </div>
        )}

        <div className="ion-margin-bottom">
          <h3>Puntos Totales: <strong>{points}</strong></h3>
          <IonText color="dark">
            <p>Progreso General: {completedMissionsCount} de {missions.length} misiones completadas</p>
          </IonText>
          <IonProgressBar value={progressPercent} color="success" />
        </div>

        {/* Tarjeta interactiva en vivo para Misión 2 */}
        {mission2Tracking && (
          <div style={{ background: '#f0f9ff', border: '2px solid #38bdf8', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#0369a1', fontWeight: 700 }}>
              🚶 Misión 2 en Curso: Movimiento Real
            </h4>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#0c4a6e' }}>
              Distancia recorrida: <strong>{mission2Tracking.distance}m</strong> de 30m requeridos
            </p>
            <IonProgressBar
              value={Math.min(1, mission2Tracking.distance / 30)}
              color={mission2Tracking.distance >= 30 ? "success" : "primary"}
              style={{ height: '10px', borderRadius: '5px', marginBottom: '10px' }}
            />
            <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#0284c7' }}>
              📡 GPS activo (Verificación #{mission2Tracking.attempts}). Camina alejándote de tu punto de inicio...
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <IonButton size="small" color="success" onClick={simulateStepMission2}>
                Completar / Simular 30m
              </IonButton>
              <IonButton size="small" fill="outline" color="danger" onClick={cancelActiveMissions}>
                Cancelar
              </IonButton>
            </div>
          </div>
        )}

        {/* Tarjeta interactiva en vivo para Misión 3 */}
        {mission3Tracking && (
          <div style={{ background: '#fefce8', border: '2px solid #facc15', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#854d0e', fontWeight: 700 }}>
              🧘 Misión 3 en Curso: Permanencia Activa
            </h4>
            <p style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#713f12', fontWeight: 600 }}>
              ⏳ Tiempo inmóvil restante: <strong>{mission3Tracking.remaining}s</strong>
            </p>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: mission3Tracking.movingDetected ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
              {mission3Tracking.movingDetected
                ? '⚠️ ¡Movimiento detectado! Reiniciando contador a 10s...'
                : '✅ Inmóvil detectado. Mantén la calma sin mover el celular...'}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <IonButton size="small" color="success" onClick={simulateStepMission3}>
                Completar / Simular 10s
              </IonButton>
              <IonButton size="small" fill="outline" color="danger" onClick={cancelActiveMissions}>
                Cancelar
              </IonButton>
            </div>
          </div>
        )}

        {photo && (
          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
              📸 Evidencia de Foto (Misión 1):
            </p>
            <img
              src={photo}
              alt="Evidencia fotográfica"
              style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }}
            />
          </div>
        )}

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