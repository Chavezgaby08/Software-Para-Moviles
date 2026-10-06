import { useState } from "react";
import { dbFirestore } from "../firebase/config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export const useCollection = (table: string) => {
  const [results, setResults] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = async () => {
    setIsPending(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(dbFirestore, table));
      const docs = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setResults(docs);
      setIsPending(false);
      return docs;
    } catch (err: any) {
      setError(err.message);
      setIsPending(false);
      return [];
    }
  };

  const add = async (data: any) => {
    setIsPending(true);
    setError(null);
    try {
      const ref = await addDoc(collection(dbFirestore, table), {
        ...data,
        createdAt: serverTimestamp()
      });
      setIsPending(false);
      return ref;
    } catch (err: any) {
      setError(err.message);
      setIsPending(false);
      return null;
    }
  };

  const remove = async (id: string) => {
    setIsPending(true);
    setError(null);
    try {
      await deleteDoc(doc(dbFirestore, table, id));
      setIsPending(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      setIsPending(false);
      return false;
    }
  };

  return { results, isPending, error, getAll, add, remove };
};
export default useCollection;