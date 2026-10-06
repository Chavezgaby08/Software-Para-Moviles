import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '../firebase/config';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const login = async (email: string, pass: string) => {
    setError(null);
    setIsPending(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setIsPending(false);
      return res.user;
    } catch (err: any) {
      setError(err.message);
      setIsPending(false);
      return null;
    }
  };
  const register = async (email: string, pass: string) => {
    setError(null);
    setIsPending(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      setIsPending(false);
      return res.user;
    } catch (err: any) {
      setError(err.message);
      setIsPending(false);
      return null;
    }
  };
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { user, loading, login, register, logout, isPending, error };
}