// screens/SplashScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocationAndPrayer } from '../hooks/useLocationAndPrayer';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { city, loading, error, getLocation } = useLocationAndPrayer();

  const handleAllowLocation = async () => {
    try {
      const result = await getLocation(); // waits for location + geocode + prayer calc
      // navigate to Home and pass the data so Home can show instantly
      navigation.replace('Home', {
        city: result.city,
        prayerTimes: result.prayerTimes,
      });
    } catch (err) {
      console.warn('getLocation failed', err);
      Alert.alert('Location Error', err.message || 'Could not determine location');
    }
  };

  const handleSelectCity = () => navigation.navigate('CitySelection');

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.iconContainer}>
        <Image source={require('../assets/mosque.jpg')} style={styles.mosqueIcon} resizeMode="contain" />
      </View>

      <Text style={styles.title}>Peace Be Upon You</Text>
      <Text style={styles.subtitle}>Welcome to Prayer Times</Text>

      <View style={styles.card}>
        <View style={styles.locationRow}>
          <Icon name="location-pin" size={20} color="#6B4930" />
          <View>
            <Text style={styles.locationTitle}>
              {loading ? 'Detecting location...' : city ? `Detected: ${city}` : 'Allow Location Access'}
            </Text>
            <Text style={styles.locationSubtitle}>{new Date().toDateString()}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.allowButton} onPress={handleAllowLocation}>
            <Text style={styles.allowText}>{loading ? 'Detecting…' : 'Allow'}</Text>
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
