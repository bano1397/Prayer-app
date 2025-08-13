// App.jsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import SplashScreen from './screens/SplashScreen';
import BottomTabs from './navigation/BottomTabs';
import SettingsScreen from './screens/SettingsScreen';
import CitySelectionScreen from './screens/CitySelectionScreen'; 

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={BottomTabs} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="CitySelection" component={CitySelectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
