import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gabriela.contactos',
  appName: 'Contacto App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
