import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";

export const useDexie = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const results = useLiveQuery(() => db.frutas.toArray()) ?? [];

  const add = async (data: { nombre: string }) => {
    setIsPending(true);
    setError(null);
    try {
      await db.frutas.add({
        ...data,
        createdAt: new Date().toISOString()
      });
      setIsPending(false);
    } catch (err: any) {
      setError(err.message);
      setIsPending(false);
    }
  };

  const deleteItem = async (id: number) => {
    setIsPending(true);
    setError(null);
    try {
      await db.frutas.delete(id);
      setIsPending(false);
    } catch (err: any) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return { results, isPending, error, add, deleteItem };
};
export default useDexie;