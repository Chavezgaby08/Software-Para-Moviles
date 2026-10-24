import { useState } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';

export const useGeolocation = () => {
  const [position, setPosition] = useState<Position | null>(null);

  const getCurrentPosition = async () => {
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    setPosition(pos);
    return pos.coords;
  };

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

  return { position, getCurrentPosition, calculateDistance };
};