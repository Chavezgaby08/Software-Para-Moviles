import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface MissionProgress {
  id: number;
  completed: boolean;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserPoints: (newPoints: number, completedMissions: MissionProgress[]) => Promise<void>;
  guestLogin: () => void;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from localStorage if present
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.warn("Failed to parse cached user:", e);
      }
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify({ uid: currentUser.uid, email: currentUser.email }));
          } else {
            const cached = localStorage.getItem('user');
            if (!cached) {
              setUser(null);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.warn("Firebase Auth listener error:", error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Failed to setup Firebase auth listener:", e);
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signOut error:", e);
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('app_progress');
    localStorage.removeItem('mission_photo');
  };

  const guestLogin = () => {
    const guestUser = {
      uid: 'invitado_' + Date.now().toString(36),
      email: 'explorador@misiones.com',
      displayName: 'Explorador Invitado'
    } as unknown as User;
    setUser(guestUser);
    localStorage.setItem('user', JSON.stringify({ uid: guestUser.uid, email: guestUser.email }));
  };

  const updateUserPoints = async (points: number, missions: MissionProgress[]) => {
    if (!user) return;
    const payload = { points, missions };
    
    // Persistencia Local
    localStorage.setItem('app_progress', JSON.stringify(payload));

    // Persistencia en Firebase Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        points: points,
        missions: missions,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Nota: Guardado local exitoso. Firebase sinc:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserPoints, guestLogin }}>
      {children}
    </AuthContext.Provider>
  );
};