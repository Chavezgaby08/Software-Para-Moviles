import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const useCamera = () => {
  const [photo, setPhoto] = useState<string | null>(null);

  const takePhoto = async (): Promise<string | null> => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      if (image.webPath) {
        setPhoto(image.webPath);
        return image.webPath;
      }
      return null;
    } catch (error) {
      console.error("Error al tomar la foto:", error);
      return null;
    }
  };

  return { photo, takePhoto };
};