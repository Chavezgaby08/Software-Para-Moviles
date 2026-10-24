import { useState, useRef } from 'react';
import { Geolocation, Position, CallbackID } from '@capacitor/geolocation';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const useGeolocation = () => {
  const [position, setPosition] = useState<LocationCoords | null>(null);
  const activeWatchIdRef = useRef<CallbackID | null>(null);
  const webWatchIdRef = useRef<number | null>(null);

  const requestGeolocationPermission = async (): Promise<boolean> => {
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        return req.location === 'granted';
      }
      return true;
    } catch (e) {
      console.warn("Permisos Capacitor Geolocation:", e);
      return true; // Continuar, el navegador o plugin pueden manejarlo
    }
  };

  const sanitizeCoords = (raw: { latitude?: unknown; longitude?: unknown; accuracy?: unknown } | null | undefined): LocationCoords | null => {
    if (!raw) return null;
    const lat = Number(raw.latitude);
    const lon = Number(raw.longitude);
    if (isNaN(lat) || isNaN(lon)) return null;
    const acc = typeof raw.accuracy === 'number' ? Math.round(raw.accuracy) : undefined;
    return { latitude: lat, longitude: lon, accuracy: acc };
  };

  const getCurrentPosition = async (): Promise<LocationCoords> => {
    await requestGeolocationPermission();

    // 1. Capacitor Geolocation nativo con alta precisión
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 5000
      });
      const sanitized = sanitizeCoords(pos?.coords);
      if (sanitized) {
        setPosition(sanitized);
        return sanitized;
      }
    } catch (highErr) {
      console.warn("GPS alta precisión advertencia:", highErr);
    }

    // 2. Capacitor Geolocation con precisión estándar
    try {
      const posLow = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 15000
      });
      const sanitized = sanitizeCoords(posLow?.coords);
      if (sanitized) {
        setPosition(sanitized);
        return sanitized;
      }
    } catch (lowErr) {
      console.warn("GPS estándar advertencia:", lowErr);
    }

    // 3. Fallback al navigator del WebView/Safari
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        const webCoords = await new Promise<LocationCoords>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (p) => {
              const res = sanitizeCoords(p.coords);
              if (res) resolve(res);
              else reject(new Error("Coordenadas no válidas"));
            },
            (err) => reject(err),
            { timeout: 5000, maximumAge: 10000, enableHighAccuracy: true }
          );
        });
        setPosition(webCoords);
        return webCoords;
      } catch (navErr) {
        console.warn("Navigator geolocation fallback advertencia:", navErr);
      }
    }

    // 4. Contingencia segura para nunca congelar la app
    const fallback = position || { latitude: 3.3633, longitude: -76.5122, accuracy: 15 };
    return fallback;
  };

  const startWatchingPosition = async (
    onLocationUpdate: (coords: LocationCoords) => void
  ): Promise<() => Promise<void>> => {
    await requestGeolocationPermission();

    // Intentar iniciar Capacitor watchPosition
    try {
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 2000
        },
        (pos: Position | null, err: unknown) => {
          if (err) {
            console.warn("Aviso en watchPosition nativo:", err);
            return;
          }
          const sanitized = sanitizeCoords(pos?.coords);
          if (sanitized) {
            setPosition(sanitized);
            onLocationUpdate(sanitized);
          }
        }
      );
      activeWatchIdRef.current = watchId;
    } catch (e) {
      console.warn("Capacitor watchPosition falló, iniciando web watchPosition:", e);
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        try {
          webWatchIdRef.current = navigator.geolocation.watchPosition(
            (p) => {
              const sanitized = sanitizeCoords(p.coords);
              if (sanitized) {
                setPosition(sanitized);
                onLocationUpdate(sanitized);
              }
            },
            (err) => console.warn("Navigator watchPosition:", err),
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
          );
        } catch (wErr) {
          console.warn("Navigator watchPosition no disponible:", wErr);
        }
      }
    }

    // Función de limpieza para detener el rastreo de ubicación
    return async () => {
      if (activeWatchIdRef.current) {
        try {
          await Geolocation.clearWatch({ id: activeWatchIdRef.current });
        } catch (clearErr) {
          console.warn("Error al detener Geolocation.clearWatch:", clearErr);
        }
        activeWatchIdRef.current = null;
      }
      if (webWatchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        try {
          navigator.geolocation.clearWatch(webWatchIdRef.current);
        } catch {
          // ignore
        }
        webWatchIdRef.current = null;
      }
    };
  };

  // Fórmula de Haversine para calcular distancia en metros entre dos coordenadas
  const calculateDistance = (
    lat1: number | string,
    lon1: number | string,
    lat2: number | string,
    lon2: number | string
  ): number => {
    const nLat1 = Number(lat1);
    const nLon1 = Number(lon1);
    const nLat2 = Number(lat2);
    const nLon2 = Number(lon2);

    if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
      return 0;
    }

    const R = 6371e3; // Radio de la tierra en metros
    const rad = Math.PI / 180;
    const dLat = (nLat2 - nLat1) * rad;
    const dLon = (nLon2 - nLon1) * rad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(nLat1 * rad) * Math.cos(nLat2 * rad) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return isNaN(dist) ? 0 : dist;
  };

  return {
    position,
    getCurrentPosition,
    startWatchingPosition,
    calculateDistance
  };
};