import React, { useEffect, useState, useContext } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

export const Results: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<UserProfile[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);

  useEffect(() => {
    // Cargar datos locales del usuario actual
    const saved = localStorage.getItem('app_progress');
    let currentPts = 0;
    let cCount = 0;

    if (saved) {
      const parsed = JSON.parse(saved);
      currentPts = parsed.points || 0;
      cCount = parsed.missions ? parsed.missions.filter((m: any) => m.completed).length : 0;
    }
    setUserPoints(currentPts);
    setCompletedCount(cCount);

    // Generar el Top 5
    loadRanking(currentPts);
  }, [user]);

  const loadRanking = async (myPoints: number) => {
    const fakeOthers: UserProfile[] = [
      { uid: 'f1', email: 'carlos@test.com', points: 120 },
      { uid: 'f2', email: 'maria@test.com', points: 80 },
      { uid: 'f3', email: 'andres@test.com', points: 40 },
      { uid: 'f4', email: 'laura@test.com', points: 0 }
    ];

    // Incluir al usuario actual real
    const me: UserProfile = {
      uid: user?.uid || 'me',
      email: user?.email || 'Tu Usuario',
      points: myPoints
    };

    const combinedList = [...fakeOthers, me];

    // Ordenar de mayor a menor puntaje
    combinedList.sort((a, b) => b.points - a.points);

    setRanking(combinedList.slice(0, 5));
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
          {ranking.map((usr, index) => {
            const isMe = usr.email === user?.email;
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
          })}
        </IonList>

        <IonButton expand="block" className="ion-margin-top" onClick={() => navigate('/missions')}>
          Volver a Misiones
        </IonButton>
      </IonContent>
    </IonPage>
  );
};