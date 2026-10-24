import { useCallback, useEffect, useRef, useState } from 'react';
import type { PluginListenerHandle } from '@capacitor/core';
import { Motion } from '@capacitor/motion';

export const useAccelerometer = () => {
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const isMovingRef = useRef(false);
  const listenerRef = useRef<PluginListenerHandle | null>(null);
  const quietTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTracking = useCallback(async () => {
    if (listenerRef.current) return;
    listenerRef.current = await Motion.addListener('accel', (event) => {
      const acc = event.acceleration;
      if (!acc) return;

      const magnitude = Math.hypot(acc.x, acc.y, acc.z);
      if (magnitude > 1.5) {
        isMovingRef.current = true;
        setIsMoving(true);
        if (quietTimeoutRef.current) clearTimeout(quietTimeoutRef.current);
        quietTimeoutRef.current = setTimeout(() => {
          isMovingRef.current = false;
          setIsMoving(false);
          quietTimeoutRef.current = null;
        }, 800);
      }
    });
  }, []);

  const stopTracking = useCallback(async () => {
    if (quietTimeoutRef.current) {
      clearTimeout(quietTimeoutRef.current);
      quietTimeoutRef.current = null;
    }
    isMovingRef.current = false;
    setIsMoving(false);
    if (listenerRef.current) {
      await listenerRef.current.remove();
      listenerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      void stopTracking();
    };
  }, [stopTracking]);

  return { isMoving, isMovingRef, startTracking, stopTracking };
};