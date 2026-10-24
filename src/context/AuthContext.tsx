import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserPoints: (newPoints: number, completedMissions: any[]) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify({ uid: currentUser.uid, email: currentUser.email }));
      } else {
        localStorage.removeItem('user');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('user');
    localStorage.removeItem('app_progress');
  };

  const updateUserPoints = async (points: number, missions: any[]) => {
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
      console.error("Error guardando en Firebase:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserPoints }}>
      {children}
    </AuthContext.Provider>
  );
};