import { Haptics } from '@capacitor/haptics';

export const useHaptics = () => {
  const vibrate = async (duration = 1000) => {
    try {
      await Haptics.vibrate({ duration });
    } catch (e) {
      console.error("Vibración no soportada en web", e);
    }
  };

  return { vibrate };
};