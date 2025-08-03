// screens/SettingsTabRedirect.js

import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

const SettingsTabRedirect = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.navigate('Settings'); // Navigate to actual settings screen
  }, []);

  return null; // Nothing shown on this dummy screen
};

export default SettingsTabRedirect;
