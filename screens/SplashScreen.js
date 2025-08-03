// screens/SplashScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';


const SplashScreen = () => {
  const navigation = useNavigation();

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS handles it differently
};

const handleAllowLocation = async () => {
  const permission = await requestLocationPermission();

  if (!permission) {
    Alert.alert('Permission Denied', 'Location permission is required.');
    return;
  }

  Geolocation.getCurrentPosition(
    position => {
      console.log('Location:', position.coords);
      // You can store this in global state or navigate with params
      navigation.replace('Home'); // Continue to tabs
    },
    error => {
      console.error('Error getting location:', error.message);
      Alert.alert('Error', 'Unable to get your location.');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );
};

const handleSelectCity = () => {
  navigation.navigate('CitySelection');
};


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Mosque Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={require('../assets/mosque.jpg')} // You must have this icon in assets
          style={styles.mosqueIcon}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Peace Be Upon You</Text>
      <Text style={styles.subtitle}>Welcome to Prayer Times</Text>

      {/* Card Section */}
      <View style={styles.card}>
        <View style={styles.locationRow}>
          <Icon name="location-pin" size={20} color="#6B4930" />
          <View>
            <Text style={styles.locationTitle}>Allow Location Access</Text>
            <Text style={styles.locationSubtitle}>
              Enable to get accurate prayer times for your area
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.allowButton} onPress={handleAllowLocation}>
            <Text style={styles.allowText}>Allow</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.selectButton} onPress={handleSelectCity}>
            <Text style={styles.selectText}>Select City</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SplashScreen;

// Add below the component in the same file or split into a separate file

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 100,
  },
  iconContainer: {
    marginBottom: 50,
  },
  mosqueIcon: {
    width: 120,
    height: 100,
    // tintColor: '#2E7D32', // Green tint
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 70,
  },
  card: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
    gap: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationSubtitle: {
    fontSize: 13,
    color: '#888',
    maxWidth: 240,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  allowButton: {
    backgroundColor: '#966A49',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  allowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  selectButton: {
    borderColor: '#6B4930',
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  selectText: {
    color: '#6B4930',
    fontSize: 16,
    fontWeight: '500',
  },
});
