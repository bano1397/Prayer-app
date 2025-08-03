import { useState, useEffect } from 'react';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import { Coordinates, PrayerTimes, CalculationMethod } from 'adhan';
import moment from 'moment-timezone';

export function useLocationAndPrayer(onComplete) {
  const [city, setCity] = useState('');
  const [prayerTimes, setPrayerTimes] = useState(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;

        // Reverse geocode to city
        const geo = await Geocoder.from(latitude, longitude);
        const comp = geo.results[0].address_components;
        const locality = comp.find(c => c.types.includes('locality'));
        setCity(locality?.long_name || '');

        // Calculate prayer times
        const coordinates = new Coordinates(latitude, longitude);
        const params = CalculationMethod.MuslimWorldLeague();
        params.madhab = params.madhab; // adjust if needed

        const now = new Date();
        const times = new PrayerTimes(coordinates, now, params);

        // Format with timezone
        const tz = moment.tz.guess();
        setPrayerTimes({
          fajr: moment(times.fajr).tz(tz).format('HH:mm'),
          dhuhr: moment(times.dhuhr).tz(tz).format('HH:mm'),
          asr: moment(times.asr).tz(tz).format('HH:mm'),
          maghrib: moment(times.maghrib).tz(tz).format('HH:mm'),
          isha: moment(times.isha).tz(tz).format('HH:mm'),
        });

        onComplete && onComplete({ city: locality?.long_name, prayerTimes });
      },
      error => console.error(error),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  return { city, prayerTimes };
}
