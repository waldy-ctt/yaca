import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yaca.chat',
  appName: 'Yaca',
  webDir: 'dist', // ⚠️ Crucial: Vite builds to 'dist'
  server: {
    androidScheme: 'https'
  }
};

export default config;
