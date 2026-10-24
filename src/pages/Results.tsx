import React, { useCallback, useState, useContext } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonText, IonSpinner, useIonViewWillEnter } from '@ionic/react';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

export const Results: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<UserProfile[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);

  const refreshResults = useCallback(async () => {
    const saved = localStorage.getItem('app_progress');
    let currentPts = 0;
    let cCount = 0;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        currentPts = typeof parsed.points === 'number' ? parsed.points : 0;
        cCount = Array.isArray(parsed.missions)
          ? parsed.missions.filter((mission: { completed?: boolean }) => mission.completed).length
          : 0;
      } catch (error) {
        console.warn('No se pudo leer el progreso local:', error);
      }
    }
    setUserPoints(currentPts);
    setCompletedCount(cCount);

    setRankingLoading(true);
    setRankingError(null);

    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs
        .map((userDoc) => {
          const data = userDoc.data();
          return {
            uid: userDoc.id,
            email: typeof data.email === 'string' ? data.email : '',
            points: typeof data.points === 'number' ? data.points : 0
          };
        })
        .filter((profile) => profile.email.length > 0)
        .sort((first, second) => second.points - first.points)
        .slice(0, 5);

      setRanking(users);
    } catch (error) {
      console.error('Error cargando ranking desde Firestore:', error);
      setRankingError('No se pudo cargar el ranking desde la base de datos.');
    } finally {
      setRankingLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    void refreshResults();
  });

  const renderRanking = () => {
    if (rankingLoading) {
      return (
        <IonItem>
          <IonSpinner slot="start" />
          <IonLabel>Cargando usuarios de la base de datos...</IonLabel>
        </IonItem>
      );
    }
    if (rankingError) {
      return (
        <IonItem>
          <IonText color="danger">{rankingError}</IonText>
        </IonItem>
      );
    }
    if (ranking.length === 0) {
      return (
        <IonItem>
          <IonLabel>Aún no hay usuarios registrados en la base de datos.</IonLabel>
        </IonItem>
      );
    }

    return ranking.map((usr, index) => {
      const isMe = usr.uid === user?.uid;
      return (
        <IonItem key={usr.uid} color={isMe ? "light" : undefined}>
          <IonBadge slot="start" color={index === 0 ? "warning" : "dark"}>
            #{index + 1}
          </IonBadge>
          <IonLabel>
            <h2>{usr.email} {isMe && " (Tú)"}</h2>
          </IonLabel>
          <IonBadge slot="end" color="primary">{usr.points} Pts</IonBadge>
        </IonItem>
      );
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="tertiary">
          <IonTitle>Resultados y Ranking</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Tu Resumen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Puntos totales:</strong> {userPoints}</p>
            <p><strong>Misiones completadas:</strong> {completedCount} / 3</p>
            <p><strong>Estado general:</strong> {completedCount === 3 ? "¡Completado con éxito!" : "En progreso"}</p>
          </IonCardContent>
        </IonCard>

        <h3>Top 5 Ranking</h3>
        <IonList>
          {renderRanking()}
        </IonList>

        <IonButton expand="block" className="ion-margin-top" onClick={() => navigate('/missions')}>
          Volver a Misiones
        </IonButton>
      </IonContent>
    </IonPage>
  );
};