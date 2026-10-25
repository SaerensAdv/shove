// Runs only in the Capacitor app build (scripts/build-app.mjs). The web build never loads this file.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar } from '@capacitor/status-bar';
if (Capacitor.isNativePlatform()) window.SHOVE_NATIVE = { platform: Capacitor.getPlatform(), App, Haptics, Preferences, LocalNotifications, StatusBar };
