// screens/PrayerTimesScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useLocationAndPrayer } from '../hooks/useLocationAndPrayer';

export default function PrayerTimesScreen() {
  const route = useRoute();
  const params = route.params || {};
  const [localCity, setLocalCity] = useState(params.city || '');
  const [times, setTimes] = useState(params.prayerTimes || null);

  const { city, prayerTimes, loading, error, getLocation } = useLocationAndPrayer();

  // if no data came from splash, fetch here
  useEffect(() => {
    let mounted = true;
    if (!times) {
      (async () => {
        try {
          const res = await getLocation();
          if (!mounted) return;
          setLocalCity(res.city);
          setTimes(res.prayerTimes);
        } catch (err) {
          console.warn('PrayerTimesScreen getLocation error', err);
        }
      })();
    }
    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.location}>{localCity || city || 'Detecting location...'} 📍</Text>
        <Text style={styles.date}>{new Date().toDateString()}</Text>
      </View>

      {times ? (
        <View style={styles.list}>
          {Object.entries(times).map(([name, time]) => (
            <View key={name} style={styles.item}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.time}>{time}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text>Loading prayer times…</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 20,
  },
  location: {
    fontSize: 18,
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  nextPrayer: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B4930',
  },
  timer: {
    fontWeight: '700',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ddd',
    marginVertical: 8,
    borderRadius: 2,
  },
  list: {
    marginTop: 10,
  },
});
