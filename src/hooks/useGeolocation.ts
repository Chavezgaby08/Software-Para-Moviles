import { useState } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';

export const useGeolocation = () => {
  const [position, setPosition] = useState<Position | null>(null);

  const requestGeolocationPermission = async () => {
    const status = await Geolocation.checkPermissions();
    if (status.location !== 'granted') {
      const requested = await Geolocation.requestPermissions();
      if (requested.location !== 'granted') {
        throw new Error('Se requiere permiso de ubicación para esta misión.');
      }
    }
  };

  const getCurrentPosition = async () => {
    await requestGeolocationPermission();
    const currentPosition = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });
    setPosition(currentPosition);
    return currentPosition.coords;
  };

  const watchPosition = async (
    onPosition: (currentPosition: Position) => void,
    onError: (error: unknown) => void
  ) => {
    await requestGeolocationPermission();
    return Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      (currentPosition, error) => {
        if (error) {
          onError(error);
          return;
        }
        if (currentPosition) {
          setPosition(currentPosition);
          onPosition(currentPosition);
        }
      }
    );
  };

  const clearPositionWatch = (id: string) => Geolocation.clearWatch({ id });

  // Fórmula de Haversine para calcular distancia en metros entre dos coordenadas
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio de la tierra en metros
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return { position, getCurrentPosition, watchPosition, clearPositionWatch, calculateDistance };
};