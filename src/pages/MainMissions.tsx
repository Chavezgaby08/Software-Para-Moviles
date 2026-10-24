import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonProgressBar,
  IonList,
  IonButton,
  IonText,
  IonLoading,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonIcon,
  IonAlert
} from '@ionic/react';
import {
  cameraOutline,
  navigateOutline,
  timerOutline,
  trophyOutline,
  logOutOutline,
  refreshOutline,
  checkmarkCircle,
  walkOutline,
  flashOutline,
  closeCircleOutline
} from 'ionicons/icons';
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

const INITIAL_MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'Misión 1: Evidencia',
    description: 'Toma una foto con la cámara y guárdala como evidencia.',
    points: 40,
    completed: false,
    unlocked: true
  },
  {
    id: 2,
    title: 'Misión 2: Movimiento real',
    description: 'Desplázate más de 30 metros de tu posición original con GPS.',
    points: 40,
    completed: false,
    unlocked: false
  },
  {
    id: 3,
    title: 'Misión 3: Permanencia activa',
    description: 'Permanece quieto 10 segundos continuos (el celular vibrará al finalizar).',
    points: 40,
    completed: false,
    unlocked: false
  }
];

// Calcula dinámicamente el desbloqueo secuencial de misiones
const computeUnlockedMissions = (missionsList: Mission[]): Mission[] => {
  const m1Done = !!missionsList.find((m) => m.id === 1)?.completed;
  const m2Done = !!missionsList.find((m) => m.id === 2)?.completed;
  const m3Done = !!missionsList.find((m) => m.id === 3)?.completed;

  return missionsList.map((m) => {
    if (m.id === 1) {
      return { ...m, unlocked: true };
    }
    if (m.id === 2) {
      // Se desbloquea si la 1 ya fue completada, o si la 2 ya estaba completada
      return { ...m, unlocked: m1Done || m2Done || m3Done };
    }
    if (m.id === 3) {
      // Se desbloquea si la 2 ya fue completada, o si la 3 ya estaba completada
      return { ...m, unlocked: m2Done || m3Done };
    }
    return m;
  });
};

export const MainMissions: React.FC = () => {
  const { user, logout, updateUserPoints } = useContext(AuthContext);
  const navigate = useNavigate();

  const { photo, takePhoto } = useCamera();
  const { getCurrentPosition, startWatchingPosition, calculateDistance } = useGeolocation();
  const { vibrate } = useHaptics();
  const { requestPermission, sendNotification } = useLocalNotifications();
  const { isMoving, isMovingRef, startTracking, stopTracking } = useAccelerometer();

  const [points, setPoints] = useState<number>(0);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [loadingText, setLoadingText] = useState<string | null>(null);
  const [showResetAlert, setShowResetAlert] = useState<boolean>(false);

  // Estado para el rastreo de Misión 2 (GPS)
  const [mission2Active, setMission2Active] = useState<boolean>(false);
  const [m2Origin, setM2Origin] = useState<LocationCoords | null>(null);
  const [m2Current, setM2Current] = useState<LocationCoords | null>(null);
  const [m2Distance, setM2Distance] = useState<number>(0);
  const [m2ReadingsCount, setM2ReadingsCount] = useState<number>(0);
  const stopM2WatchRef = useRef<(() => Promise<void>) | null>(null);

  // Estado para el rastreo de Misión 3 (Permanencia/Acelerómetro)
  const [mission3Active, setMission3Active] = useState<boolean>(false);
  const [m3Remaining, setM3Remaining] = useState<number>(10);
  const [m3MovedWarning, setM3MovedWarning] = useState<boolean>(false);
  const m3TimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const m3QuietSecondsRef = useRef(0);
  const m3CompletingRef = useRef(false);
  const completeMission3Ref = useRef<() => Promise<void>>(async () => {});

  // Cargar progreso al iniciar (primero de LocalStorage y luego sincroniza de Firestore)
  useEffect(() => {
    requestPermission();

    // 1. Restaurar progreso local inmediatamente
    const saved = localStorage.getItem('app_progress');
    let loadedPoints = 0;
    let baseMissions = INITIAL_MISSIONS;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.points === 'number') {
          loadedPoints = parsed.points;
        }
        if (Array.isArray(parsed.missions)) {
          baseMissions = INITIAL_MISSIONS.map((im) => {
            const found = parsed.missions.find((sm: { id: number; completed: boolean }) => sm.id === im.id);
            return found ? { ...im, completed: !!found.completed } : im;
          });
        }
      } catch (e) {
        console.warn('Error leyendo progreso local:', e);
      }
    }

    const computed = computeUnlockedMissions(baseMissions);
    setPoints(loadedPoints);
    setMissions(computed);

    // 2. Si hay usuario autenticado en Firestore, consultar progreso remoto
    if (user?.uid && !user.uid.startsWith('invitado_')) {
      const syncRemote = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (typeof data.points === 'number' && Array.isArray(data.missions)) {
              const remoteMissions = INITIAL_MISSIONS.map((im) => {
                const found = data.missions.find((rm: { id: number; completed: boolean }) => rm.id === im.id);
                return found ? { ...im, completed: !!found.completed } : im;
              });
              const finalMissions = computeUnlockedMissions(remoteMissions);
              setPoints(data.points);
              setMissions(finalMissions);
              localStorage.setItem(
                'app_progress',
                JSON.stringify({
                  points: data.points,
                  missions: finalMissions.map((m) => ({ id: m.id, completed: m.completed }))
                })
              );
            }
          }
        } catch (err) {
          console.warn('Firestore sinc advertencia:', err);
        }
      };
      syncRemote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Guardar progreso y notificar
  const saveProgress = useCallback(
    async (updatedMissions: Mission[], additionalPoints: number) => {
      const newPoints = points + additionalPoints;
      const finalMissions = computeUnlockedMissions(updatedMissions);

      setPoints(newPoints);
      setMissions(finalMissions);

      const minimalMissions = finalMissions.map((m) => ({
        id: m.id,
        completed: m.completed
      }));

      // Guardado local y remoto
      await updateUserPoints(newPoints, minimalMissions);
    },
    [points, updateUserPoints]
  );

  // Detener rastreo M2
  const stopM2 = useCallback(async () => {
    if (stopM2WatchRef.current) {
      await stopM2WatchRef.current();
      stopM2WatchRef.current = null;
    }
    setMission2Active(false);
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (stopM2WatchRef.current) {
        stopM2WatchRef.current();
      }
      if (m3TimerRef.current) {
        clearInterval(m3TimerRef.current);
      }
      stopTracking();
    };
  }, [stopTracking]);

  // Completar Misión 1 (Foto)
  const handleMission1 = async () => {
    setLoadingText('Abriendo cámara...');
    try {
      const photoUrl = await takePhoto();
      if (photoUrl) {
        setLoadingText('Guardando evidencia...');
        localStorage.setItem('mission_photo', photoUrl);

        const updated = missions.map((m) => (m.id === 1 ? { ...m, completed: true } : m));
        await saveProgress(updated, 40);

        await vibrate(500);
        await sendNotification('¡Misión 1 Completada!', 'Has guardado tu evidencia. Te faltan 2 misiones para completar.');
      }
    } catch (err) {
      console.warn('Error en Misión 1:', err);
    } finally {
      setLoadingText(null);
    }
  };

  // Completar exitosamente la Misión 2
  const completeMission2 = useCallback(
    async (finalDistance: number) => {
      await stopM2();
      await vibrate(1000);

      const updated = missions.map((m) => (m.id === 2 ? { ...m, completed: true } : m));
      await saveProgress(updated, 40);

      await sendNotification(
        '¡Has completado una misión!',
        `¡Recorriste ${Math.round(finalDistance)} metros! Te falta 1 misión para completar.`
      );
    },
    [missions, saveProgress, stopM2, vibrate, sendNotification]
  );

  // Iniciar Misión 2 (GPS)
  const handleMission2 = async () => {
    setLoadingText('Calibrando GPS en tiempo real...');
    try {
      const startPos = await getCurrentPosition();
      setM2Origin(startPos);
      setM2Current(startPos);
      setM2Distance(0);
      setM2ReadingsCount(1);
      setMission2Active(true);
      setLoadingText(null);

      // Iniciar el observador con maximumAge: 0 y polling activo
      const cleanup = await startWatchingPosition((freshCoords) => {
        setM2ReadingsCount((prev) => prev + 1);
        setM2Current(freshCoords);

        if (startPos) {
          const dist = calculateDistance(
            startPos.latitude,
            startPos.longitude,
            freshCoords.latitude,
            freshCoords.longitude
          );
          setM2Distance(dist);

          // Si supera los 30 metros requeridos, completar automáticamente
          if (dist >= 30) {
            completeMission2(dist);
          }
        }
      });

      stopM2WatchRef.current = cleanup;
    } catch (err) {
      console.warn('Error iniciando Misión 2:', err);
      setLoadingText(null);
    }
  };

  // Simulación paso a paso de M2 (para pruebas en interiores / escritorio)
  const handleSimulateStepM2 = () => {
    const nextDist = m2Distance + 10;
    setM2Distance(nextDist);
    setM2ReadingsCount((prev) => prev + 1);
    if (nextDist >= 30) {
      completeMission2(nextDist);
    }
  };

  // Completar Misión 2 directamente (acceso rápido de validación)
  const handleForceCompleteM2 = () => {
    completeMission2(35);
  };

  // Completar Misión 3 exitosamente
  const completeMission3 = useCallback(async () => {
    if (m3CompletingRef.current) return;
    m3CompletingRef.current = true;
    if (m3TimerRef.current) {
      clearInterval(m3TimerRef.current);
      m3TimerRef.current = null;
    }
    await stopTracking();
    setMission3Active(false);

    // Requisito técnico: Pasados los 10 segundos el celular vibra
    await vibrate(1500);

    const updated = missions.map((m) => (m.id === 3 ? { ...m, completed: true } : m));
    await saveProgress(updated, 40);

    await sendNotification(
      '¡Has completado una misión!',
      '¡Increíble! Superaste la Misión 3 y finalizaste todas las misiones.'
    );
  }, [missions, saveProgress, stopTracking, vibrate, sendNotification]);

  completeMission3Ref.current = completeMission3;

  // Iniciar Misión 3 (Acelerómetro / 10s quieto)
  const handleMission3 = async () => {
    if (mission3Active) return;
    setMission3Active(true);
    setM3Remaining(10);
    setM3MovedWarning(false);

    try {
      await startTracking();
    } catch (err) {
      console.error('No se pudo iniciar el acelerómetro:', err);
      setMission3Active(false);
      return;
    }
  };

  // El contador solo corre durante intervalos continuos sin movimiento.
  useEffect(() => {
    if (!mission3Active) return;

    if (m3TimerRef.current) {
      clearInterval(m3TimerRef.current);
      m3TimerRef.current = null;
    }

    if (isMoving) {
      setM3MovedWarning(true);
      m3QuietSecondsRef.current = 0;
      setM3Remaining(10);
      return;
    }

    setM3MovedWarning(false);
    m3QuietSecondsRef.current = 0;
    const timer = setInterval(() => {
      if (isMovingRef.current) return;

      m3QuietSecondsRef.current += 1;
      const remaining = Math.max(0, 10 - m3QuietSecondsRef.current);
      setM3Remaining(remaining);
      if (remaining === 0) void completeMission3Ref.current();
    }, 1000);
    m3TimerRef.current = timer;

    return () => {
      clearInterval(timer);
      if (m3TimerRef.current === timer) m3TimerRef.current = null;
    };
  }, [mission3Active, isMoving, isMovingRef]);

  // Cancelar Misión 3
  const cancelMission3 = async () => {
    m3CompletingRef.current = false;
    if (m3TimerRef.current) {
      clearInterval(m3TimerRef.current);
      m3TimerRef.current = null;
    }
    m3QuietSecondsRef.current = 0;
    await stopTracking();
    setMission3Active(false);
    setM3Remaining(10);
  };

  // Ejecución según la misión seleccionada
  const handleExecuteMission = (mission: Mission) => {
    if (mission.id === 1) handleMission1();
    if (mission.id === 2) handleMission2();
    if (mission.id === 3) handleMission3();
  };

  // Reiniciar misiones (para demostración o volver a empezar sin desloguearse)
  const handleResetMissions = async () => {
    await stopM2();
    await cancelMission3();
    const fresh = INITIAL_MISSIONS.map((m) => ({ ...m, completed: false, unlocked: m.id === 1 }));
    setPoints(0);
    setMissions(fresh);
    localStorage.removeItem('mission_photo');
    await updateUserPoints(0, fresh.map((m) => ({ id: m.id, completed: false })));
  };

  const completedCount = missions.filter((m) => m.completed).length;
  const progressRatio = completedCount / missions.length;
  const allCompleted = completedCount === missions.length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Panel de Misiones</IonTitle>
          <IonButtons slot="end">
            <IonButton title="Reiniciar" onClick={() => setShowResetAlert(true)}>
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
            <IonButton title="Cerrar sesión" onClick={logout}>
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Encabezado de Usuario y Puntaje */}
        <div style={{ marginBottom: '16px' }}>
          <IonText color="dark">
            <h2 style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
              Hola, {user?.displayName || user?.email?.split('@')[0] || 'Explorador'}
            </h2>
          </IonText>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <IonBadge color="warning" style={{ fontSize: '1rem', padding: '6px 12px' }}>
              {points} Puntos Totales
            </IonBadge>
            <IonBadge color={allCompleted ? 'success' : 'tertiary'} style={{ fontSize: '0.9rem', padding: '6px 10px' }}>
              {completedCount} de {missions.length} completadas ({Math.round(progressRatio * 100)}%)
            </IonBadge>
          </div>
        </div>

        {/* Barra de Progreso General */}
        <div style={{ marginBottom: '20px' }}>
          <IonProgressBar value={progressRatio} color={allCompleted ? 'success' : 'primary'} />
        </div>

        {/* Panel Interactivo de Misión 2 Activa (GPS en Vivo) */}
        {mission2Active && (
          <IonCard color="light" style={{ border: '2px solid #3880ff', marginBottom: '20px' }}>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={navigateOutline} color="primary" />
                Rastreo GPS en Tiempo Real
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ margin: '4px 0' }}>
                <strong>Distancia recorrida:</strong>{' '}
                <span style={{ fontSize: '1.3rem', color: m2Distance >= 30 ? '#2dd36f' : '#3880ff', fontWeight: 'bold' }}>
                  {m2Distance.toFixed(1)} m
                </span>{' '}
                / 30 m requeridos
              </p>
              <IonProgressBar
                value={Math.min(m2Distance / 30, 1)}
                color={m2Distance >= 30 ? 'success' : 'primary'}
                style={{ height: '8px', borderRadius: '4px', margin: '8px 0' }}
              />

              <div style={{ fontSize: '0.82rem', color: '#666', background: '#fff', padding: '8px', borderRadius: '6px', margin: '8px 0' }}>
                <div>📍 <strong>Origen:</strong> {m2Origin ? `${m2Origin.latitude.toFixed(5)}, ${m2Origin.longitude.toFixed(5)}` : 'Obteniendo...'}</div>
                <div>📡 <strong>Actual:</strong> {m2Current ? `${m2Current.latitude.toFixed(5)}, ${m2Current.longitude.toFixed(5)}` : 'Leyendo...'}</div>
                <div>🎯 <strong>Precisión:</strong> ±{m2Current?.accuracy ?? 8} m | 🔄 <strong>Lecturas:</strong> {m2ReadingsCount}</div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <IonButton size="small" fill="outline" color="danger" onClick={stopM2}>
                  <IonIcon slot="start" icon={closeCircleOutline} />
                  Cancelar
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Panel Interactivo de Misión 3 Activa (Acelerómetro en Vivo) */}
        {mission3Active && (
          <IonCard color="light" style={{ border: '2px solid #2dd36f', marginBottom: '20px' }}>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={timerOutline} color="success" />
                Misión 3: Mantente Quieto
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: m3MovedWarning ? '#eb445a' : '#2dd36f' }}>
                  {m3Remaining}s
                </div>
                <p style={{ margin: '4px 0', fontWeight: '500' }}>
                  {m3MovedWarning ? '⚠️ ¡Movimiento detectado! Quédate quieto...' : 'Mantén el dispositivo quieto (sin bloquear)'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>El celular vibrará al completar los 10 segundos.</p>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <IonButton size="small" fill="outline" color="danger" onClick={cancelMission3}>
                  Cancelar
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Foto de Evidencia de Misión 1 (si fue tomada) */}
        {photo && (
          <IonCard style={{ marginBottom: '16px' }}>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IonIcon icon={cameraOutline} color="success" />
                Evidencia de Misión 1 Guardada
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ textAlign: 'center' }}>
              <img
                src={photo}
                alt="Evidencia Misión 1"
                style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }}
              />
            </IonCardContent>
          </IonCard>
        )}

        {/* Lista de Misiones Secuenciales */}
        <IonText color="medium">
          <p style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            Lista de Misiones
          </p>
        </IonText>

        <IonList inset={true} style={{ margin: '0 0 20px 0' }}>
          {missions.map((mission) => {
            const isThisActive =
              (mission.id === 2 && mission2Active) ||
              (mission.id === 3 && mission3Active);

            return (
              <MissionItem
                key={mission.id}
                mission={mission}
                isActive={isThisActive}
                onExecute={handleExecuteMission}
              />
            );
          })}
        </IonList>

        {/* Acceso a Pantalla de Resultados y Ranking */}
        <IonButton
          expand="block"
          color="tertiary"
          size="large"
          style={{ marginTop: '16px' }}
          onClick={() => navigate('/results')}
        >
          <IonIcon slot="start" icon={trophyOutline} />
          Ver Resultados y Ranking
        </IonButton>

        {allCompleted && (
          <div style={{ textAlign: 'center', marginTop: '16px', padding: '12px', background: '#d7f8df', borderRadius: '8px' }}>
            <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '2rem' }} />
            <h3 style={{ margin: '6px 0', color: '#137333', fontWeight: 'bold' }}>¡Felicitaciones!</h3>
            <p style={{ margin: '0', fontSize: '0.9rem', color: '#137333' }}>
              Has completado todas las misiones y alcanzado 120 puntos.
            </p>
          </div>
        )}

        {/* Alerta de confirmación para reiniciar */}
        <IonAlert
          isOpen={showResetAlert}
          onDidDismiss={() => setShowResetAlert(false)}
          header="¿Reiniciar progreso?"
          message="Se restablecerán las misiones y los puntos a 0 para que puedas volver a probarlas desde el inicio."
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Sí, Reiniciar', handler: handleResetMissions }
          ]}
        />

        <IonLoading isOpen={!!loadingText} message={loadingText || ''} />
      </IonContent>
    </IonPage>
  );
};
export default MainMissions;