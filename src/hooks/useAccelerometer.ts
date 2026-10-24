import { useEffect, useState, useRef } from 'react';
import { Motion } from '@capacitor/motion';

export const useAccelerometer = () => {
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const listenerRef = useRef<any>(null);

  const startTracking = async () => {
    listenerRef.current = await Motion.addListener('accel', (event) => {
      const acc = event.acceleration;
      if (acc) {
        const magnitude = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
        // Si la magnitud supera un umbral de ruido, el usuario se está moviendo
        setIsMoving(magnitude > 1.5);
      }
    });
  };

  const stopTracking = async () => {
    if (listenerRef.current) {
      await listenerRef.current.remove();
      listenerRef.current = null;
    }
  };

  useEffect(() => {
    return () => { stopTracking(); };
  }, []);

  return { isMoving, startTracking, stopTracking };
};