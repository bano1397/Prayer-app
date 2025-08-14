import { useState, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Coordinates, PrayerTimes, CalculationMethod } from 'adhan';
import moment from 'moment-timezone';

export function useLocationAndPrayer() {
  const [city, setCity] = useState('');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configure geolocation for better Android compatibility
  const configureGeolocation = useCallback(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      enableBackgroundLocationUpdates: false,
      locationProvider: 'auto', // Uses Play Services if available, falls back to Android Location API
    });
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const fineLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const coarseLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        
        return fineLocationGranted || coarseLocationGranted;
      } catch (error) {
        console.warn('Permission check error:', error);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // First check if permissions are already granted
        const hasPermissions = await checkPermissions();
        if (hasPermissions) {
          return true;
        }

        const androidVersion = Platform.Version;
        
        // For Android 6.0+ (API 23+), request runtime permissions
        if (androidVersion >= 23) {
          // Request location permissions one by one for better success rate
          let granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission Required',
              message: 'This app needs access to your location to show accurate prayer times.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );

          // If fine location denied, try coarse location
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
              {
                title: 'Location Permission Required', 
                message: 'This app needs access to your approximate location to show prayer times.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              }
            );
          }

          const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
          
          // Log the permission result for debugging
          console.log('Android permission result:', granted, 'Granted:', isGranted);
          
          return isGranted;
        } else {
          // Android < 6.0 permissions are granted at install time
          return true;
        }
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    } else {
      // iOS permission handling
      try {
        return new Promise((resolve) => {
          Geolocation.requestAuthorization(
            () => {
              console.log('iOS location permission granted');
              resolve(true);
            },
            (error) => {
              console.warn('iOS location permission denied:', error);
              resolve(false);
            }
          );
        });
      } catch (error) {
        console.warn('iOS permission error:', error);
        return false;
      }
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PrayerApp/1.0 (contact@example.com)' },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      const addr = data.address || {};
      return addr.city || addr.town || addr.village || addr.county || addr.state || 'Unknown Location';
    } catch (e) {
      console.warn('reverseGeocode failed', e);
      return 'Location Not Found';
    }
  };

  const computePrayerTimes = (lat, lon) => {
    try {
      const coordinates = new Coordinates(lat, lon);
      const params = CalculationMethod.MuslimWorldLeague();
      const now = new Date();
      const times = new PrayerTimes(coordinates, now, params);
      const tz = moment.tz.guess();

      return {
        fajr: moment(times.fajr).tz(tz).format('HH:mm'),
        dhuhr: moment(times.dhuhr).tz(tz).format('HH:mm'),
        asr: moment(times.asr).tz(tz).format('HH:mm'),
        maghrib: moment(times.maghrib).tz(tz).format('HH:mm'),
        isha: moment(times.isha).tz(tz).format('HH:mm'),
      };
    } catch (error) {
      console.warn('Prayer times calculation error:', error);
      throw new Error('Failed to calculate prayer times');
    }
  };

  const getLocation = useCallback(() => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      setError(null);

      try {
        // Configure geolocation first
        configureGeolocation();

        // Check and request permissions
        const permissionGranted = await requestPermission();
        
        if (!permissionGranted) {
          const err = new Error('Location permission is required to show prayer times. Please enable location access in your device settings.');
          setError(err);
          setLoading(false);
          return reject(err);
        }

        console.log('Attempting to get location...');

        // Get current position with optimized options for Android
        Geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude, accuracy } = position.coords;
              
              console.log(`Location acquired: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);

              // Get city name
              const cityName = await reverseGeocode(latitude, longitude);
              
              // Calculate prayer times
              const times = computePrayerTimes(latitude, longitude);

              // Update state
              setCity(cityName);
              setPrayerTimes(times);
              setLoading(false);
              
              resolve({ 
                city: cityName, 
                prayerTimes: times,
                coordinates: { latitude, longitude },
                accuracy 
              });
            } catch (innerErr) {
              console.warn('Location processing error:', innerErr);
              setLoading(false);
              setError(innerErr);
              reject(innerErr);
            }
          },
          (geoError) => {
            console.warn('Geolocation error:', geoError);
            
            let errorMessage = 'Unable to get your location';
            let suggestions = '';
            
            switch (geoError.code) {
              case 1: // PERMISSION_DENIED
                errorMessage = 'Location permission denied';
                suggestions = 'Please enable location permissions in Settings > Apps > Your App > Permissions';
                break;
              case 2: // POSITION_UNAVAILABLE
                errorMessage = 'Location service unavailable';
                suggestions = 'Please make sure GPS/Location services are enabled';
                break;
              case 3: // TIMEOUT
                errorMessage = 'Location request timed out';
                suggestions = 'Please try again or move to an area with better GPS signal';
                break;
              default:
                errorMessage = geoError.message || 'Unknown location error';
                suggestions = 'Please check your location settings and try again';
            }
            
            const fullMessage = suggestions ? `${errorMessage}. ${suggestions}` : errorMessage;
            const error = new Error(fullMessage);
            error.code = geoError.code;
            
            setLoading(false);
            setError(error);
            reject(error);
          },
          {
            enableHighAccuracy: false, // Start with less accurate but faster location
            timeout: 15000, // Reduced timeout for first attempt
            maximumAge: 300000, // 5 minutes cache
          }
        );
      } catch (permErr) {
        console.warn('Permission error:', permErr);
        setLoading(false);
        setError(permErr);
        reject(permErr);
      }
    });
  }, [configureGeolocation, requestPermission]);

  // Method to watch location changes (useful for live updates)
  const watchLocation = useCallback(() => {
    return new Promise(async (resolve, reject) => {
      try {
        configureGeolocation();
        const permissionGranted = await requestPermission();
        
        if (!permissionGranted) {
          return reject(new Error('Location permission denied'));
        }

        const watchId = Geolocation.watchPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const cityName = await reverseGeocode(latitude, longitude);
              const times = computePrayerTimes(latitude, longitude);

              setCity(cityName);
              setPrayerTimes(times);
              
              resolve({
                watchId,
                city: cityName,
                prayerTimes: times,
                coordinates: { latitude, longitude }
              });
            } catch (error) {
              reject(error);
            }
          },
          (error) => reject(error),
          {
            enableHighAccuracy: false, // Use less battery for watching
            timeout: 30000,
            maximumAge: 60000, // 1 minute cache for watching
            distanceFilter: 100, // Only update if moved 100m
          }
        );

        return watchId;
      } catch (error) {
        reject(error);
      }
    });
  }, [configureGeolocation]);

  // Method to clear location watch
  const clearLocationWatch = useCallback((watchId) => {
    if (watchId) {
      Geolocation.clearWatch(watchId);
    }
  }, []);

  // Method to stop all location observing
  const stopLocationObserving = useCallback(() => {
    Geolocation.stopObserving();
  }, []);

  return { 
    city, 
    prayerTimes, 
    loading, 
    error, 
    getLocation,
    watchLocation,
    clearLocationWatch,
    stopLocationObserving
  };
}