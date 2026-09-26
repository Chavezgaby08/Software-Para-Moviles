import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
// The Firebase config module is JavaScript and has no declaration file.
// Keep the imported Auth value typed without requiring changes to that module.
import { auth } from '../firebase/config';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (isMounted) {
          setUser(currentUser);
          setLoading(false);
        }
      },
      (error) => {
        console.warn('Firebase Auth error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Timeout safety net in case network is disconnected
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 2500);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
  const register = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
  const logout = () => signOut(auth);

  return { user, loading, login, register, logout };
}