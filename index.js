import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// Must be outside of any component
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Message handled in the background!', remoteMessage);
  
  // You can perform background tasks here
  // Like saving to AsyncStorage, updating badge count, etc.
});

AppRegistry.registerComponent(appName, () => App);