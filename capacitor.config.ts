import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.anbabyapp',
  appName: '安心餵-餵寶',
  webDir: 'public',
  server: {
    url: 'http://172.20.10.10:8080',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  }
};

export default config;
