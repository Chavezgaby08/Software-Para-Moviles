import React, { useState, useEffect, useContext, useRef } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonProgressBar, IonList, IonButton, IonText, IonLoading, IonButtons, IonCard, IonCardContent } from '@ionic/react';
import { AuthContext } from '../context/AuthContext';
import { MissionItem } from '../components/MissionItem';
import { Mission } from '../types';
import { useCamera } from '../hooks/useCamera';
import { useGeolocation, LocationCoords } from '../hooks/useGeolocation';
import { useHaptics } from '../hooks/useHaptics';
import { useLocalNotifications } from '../hooks/useLocalNotifications';
import { useAccelerometer } from '../hooks/useAccelerometer';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Mission2TrackingState {
  initialCoords: LocationCoords | null;
  currentCoords: LocationCoords | null;
  distance: number;
  readingsCount: number;
  statusText: string;
  isFixing: boolean;
}

// Función para calcular el estado de desbloqueo según la secuencia de misiones
const computeUnlockedMissions = (missionsList: Mission[]): Mission[] => {
  const m1Done = !!missionsList.find(m => m.id === 1)?.completed;
  const m2Done = !!missionsList.find(m => m.id === 2)?.completed;

  return missionsList.map(m => {
    if (m.id === 1) {
      return { ...m, unlocked: true };
    }
    if (m.id === 2) {
      return { ...m, unlocked: m1Done };
    }
    if (m.id === 3) {
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
  const { getCurrentPosition, startWatchingPosition, calculateDistance } = useGeolocation();
  const { vibrate } = useHaptics();
  const { requestPermission, sendNotification } = useLocalNotifications();
  const { isMoving, startTracking, stopTracking } = useAccelerometer();

  const [points, setPoints] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string | null>(null);

  const [mission2Tracking, setMission2Tracking] = useState<Mission2TrackingState | null>(null);
  const [mission3Tracking, setMission3Tracking] = useState<{ remaining: number; movingDetected: boolean } | null>(null);

  const mission2WatchCleanupRef = useRef<(() => Promise<void>) | null>(null);
  const mission2IntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

    // 1. Cargar datos locales inmediatamente para que nunca se pierda el estado
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

    // 2. Sincronizar desde Firebase Firestore
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

  // Misión 2: Geolocalización (>30m) - Modo en vivo interactivo con watchPosition y botones de prueba
  const handleMission2 = async () => {
    // 1. Mostrar de inmediato la tarjeta de seguimiento para feedback instantáneo
    setMission2Tracking({
      initialCoords: null,
      currentCoords: null,
      distance: 0,
      readingsCount: 0,
      statusText: "Conectando al GPS del iPhone y fijando punto de partida...",
      isFixing: true
    });

    try {
      // 2. Obtener punto inicial real
      const startFix = await getCurrentPosition();
      const initialPoint: LocationCoords = startFix;
      let highestDistance = 0;
      let readings = 1;

      setMission2Tracking({
        initialCoords: startFix,
        currentCoords: startFix,
        distance: 0,
        readingsCount: readings,
        statusText: "Punto inicial fijado. GPS en transmisión en vivo. Camina alejándote...",
        isFixing: false
      });

      // Función para procesar una nueva coordenada recibida del sensor
      const handleNewCoords = (newCoords: LocationCoords) => {
        readings++;
        const calculated = calculateDistance(
          initialPoint.latitude,
          initialPoint.longitude,
          newCoords.latitude,
          newCoords.longitude
        );

        const currentDist = Math.round(calculated);
        if (currentDist > highestDistance) {
          highestDistance = currentDist;
        }

        setMission2Tracking(prev => {
          if (!prev) return null;
          const distToUse = Math.max(prev.distance, highestDistance);
          return {
            ...prev,
            currentCoords: newCoords,
            distance: distToUse,
            readingsCount: readings,
            statusText: `GPS activo (#${readings}) - Precisión: ±${newCoords.accuracy || 8}m. Camina alejándote...`,
            isFixing: false
          };
        });

        // Verificar condición de cumplimiento: distancia >= 30m
        if (highestDistance >= 30) {
          cleanupMission2();
          completeMission(2);
        }
      };

      // 3. Iniciar watchPosition nativo de Capacitor
      const cleanupWatch = await startWatchingPosition(handleNewCoords);
      mission2WatchCleanupRef.current = cleanupWatch;

      // 4. Polling periódico de seguridad cada 2.5s por si el dispositivo no emite eventos automáticos
      const interval = setInterval(async () => {
        try {
          const freshCoords = await getCurrentPosition();
          handleNewCoords(freshCoords);
        } catch (e) {
          console.warn("Aviso en intervalo de GPS:", e);
        }
      }, 2500);
      mission2IntervalRef.current = interval;

    } catch (e) {
      console.warn("Error al inicializar GPS:", e);
      setMission2Tracking(prev => prev ? {
        ...prev,
        isFixing: false,
        statusText: "GPS no disponible temporalmente. Puedes usar los botones de paso para probar."
      } : null);
    }
  };

  const cleanupMission2 = () => {
    if (mission2IntervalRef.current) {
      clearInterval(mission2IntervalRef.current);
      mission2IntervalRef.current = null;
    }
    if (mission2WatchCleanupRef.current) {
      mission2WatchCleanupRef.current();
      mission2WatchCleanupRef.current = null;
    }
    setMission2Tracking(null);
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
        secondsStill = 0; // Reinicia contador si detecta movimiento
        setMission3Tracking({ remaining: 10, movingDetected: true });
      } else {
        secondsStill += 1;
        setMission3Tracking({ remaining: Math.max(0, 10 - secondsStill), movingDetected: false });
      }

      if (secondsStill >= 10) {
        cleanupMission3();
        vibrate(1000); // Pasados 10 segundos el celular vibra
        completeMission(3);
      }
    }, 1000);

    mission3TimerRef.current = timer;
  };

  const cleanupMission3 = () => {
    if (mission3TimerRef.current) {
      clearInterval(mission3TimerRef.current);
      mission3TimerRef.current = null;
    }
    stopTracking();
    setMission3Tracking(null);
  };

  const simulateStepMission3 = () => {
    cleanupMission3();
    vibrate(1000);
    completeMission(3);
  };

  const cancelActiveMissions = () => {
    cleanupMission2();
    cleanupMission3();
    setLoadingText(null);
  };

  const executeMission = (mission: Mission) => {
    if (mission.id === 1) handleMission1();
    if (mission.id === 2) handleMission2();
    if (mission.id === 3) handleMission3();
  };

  const completedMissionsCount = missions.filter(m => m.completed).length;
  const progressPercent = missions.length > 0 ? completedMissionsCount / missions.length : 0;

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
          <IonCard style={{ margin: '0 0 16px 0', border: '2px solid #0284c7', borderRadius: '12px', background: '#f0f9ff' }}>
            <IonCardContent>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, color: '#0369a1', fontWeight: 700, fontSize: '1.05rem' }}>
                  🚶 Misión 2 en Curso: Movimiento Real
                </h3>
                <span style={{ fontSize: '0.75rem', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  GPS EN VIVO
                </span>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#0c4a6e' }}>
                  Distancia recorrida: <strong style={{ fontSize: '1.25rem', color: '#0369a1' }}>{mission2Tracking.distance}m</strong> / 30m requeridos
                </p>
                <IonProgressBar
                  value={Math.min(1, mission2Tracking.distance / 30)}
                  color={mission2Tracking.distance >= 30 ? "success" : "primary"}
                  style={{ height: '10px', borderRadius: '5px' }}
                />
              </div>

              {/* Detalle técnico visible de GPS para el usuario */}
              <div style={{ background: '#e0f2fe', padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem', color: '#0369a1', marginBottom: '12px', lineHeight: 1.4 }}>
                <div><strong>📍 Punto Inicio:</strong> {mission2Tracking.initialCoords ? `${mission2Tracking.initialCoords.latitude.toFixed(6)}, ${mission2Tracking.initialCoords.longitude.toFixed(6)}` : 'Obteniendo fix inicial...'}</div>
                <div><strong>📍 Posición Actual:</strong> {mission2Tracking.currentCoords ? `${mission2Tracking.currentCoords.latitude.toFixed(6)}, ${mission2Tracking.currentCoords.longitude.toFixed(6)}` : 'Buscando satélites...'}</div>
                <div style={{ marginTop: '2px', color: '#0284c7' }}>📡 {mission2Tracking.statusText}</div>
              </div>

            </IonCardContent>
          </IonCard>
        )}

        {/* Tarjeta interactiva en vivo para Misión 3 */}
        {mission3Tracking && (
          <IonCard style={{ margin: '0 0 16px 0', border: '2px solid #eab308', borderRadius: '12px', background: '#fefce8' }}>
            <IonCardContent>
              <h3 style={{ margin: '0 0 8px 0', color: '#854d0e', fontWeight: 700 }}>
                Misión 3 en Curso: Permanencia Activa
              </h3>
              <p style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#713f12', fontWeight: 600 }}>
                Tiempo inmóvil restante: <strong>{mission3Tracking.remaining}s</strong>
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
            </IonCardContent>
          </IonCard>
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
            <MissionItem
              key={m.id}
              mission={m}
              isActive={m.id === 2 ? !!mission2Tracking : m.id === 3 ? !!mission3Tracking : false}
              onExecute={executeMission}
            />
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