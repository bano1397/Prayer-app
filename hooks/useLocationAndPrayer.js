// hooks/useLocationAndPrayer.js
import { useState, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Coordinates, PrayerTimes, CalculationMethod } from 'adhan';
import moment from 'moment-timezone';

export function useLocationAndPrayer() {
  const [city, setCity] = useState('');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs your location to calculate prayer times.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // iOS: ask using the geolocation API
      const resp = await Geolocation.requestAuthorization('whenInUse'); // returns 'granted' on success
      return resp === 'granted' || resp === 'authorized';
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      // Nominatim - free (respect usage limits). Include a User-Agent header.
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PrayerApp/1.0 (contact@example.com)' },
      });
      const data = await res.json();
      const addr = data.address || {};
      return addr.city || addr.town || addr.village || addr.county || addr.state || data.display_name || '';
    } catch (e) {
      console.warn('reverseGeocode failed', e);
      return '';
    }
  };

  const computePrayerTimes = (lat, lon) => {
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
  };

  // getLocation returns a Promise that resolves with { city, prayerTimes }
  const getLocation = useCallback(() => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      setError(null);

      try {
        const ok = await requestPermission();
        if (!ok) {
          const err = new Error('Location permission denied');
          setError(err);
          setLoading(false);
          return reject(err);
        }

        Geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              // reverse geocode (best-effort)
              const cityName = await reverseGeocode(latitude, longitude);
              const times = computePrayerTimes(latitude, longitude);

              setCity(cityName);
              setPrayerTimes(times);
              setLoading(false);
              resolve({ city: cityName, prayerTimes: times });
            } catch (innerErr) {
              setLoading(false);
              setError(innerErr);
              reject(innerErr);
            }
          },
          (geoErr) => {
            setLoading(false);
            setError(geoErr);
            reject(geoErr);
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 10000,
            forceRequestLocation: true, // supported by react-native-geolocation-service
            showLocationDialog: true,
          }
        );
      } catch (permErr) {
        setLoading(false);
        setError(permErr);
        reject(permErr);
      }
    });
  }, []);

  return { city, prayerTimes, loading, error, getLocation };
}
