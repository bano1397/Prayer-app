import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import PrayerCard from '../components/PrayerCard';
import { useLocationAndPrayer } from '../hooks/useLocationAndPrayer';

// import { getTimeUntilNextPrayer } from '../utils/timeUtils';

const prayerData = [
  { name: 'Fajr', time: '05:23' },
  { name: 'Dhuhr', time: '12:30' },
  { name: 'Asr', time: '15:45' },
  { name: 'Maghrib', time: '18:23' },
  { name: 'Isha', time: '19:53' },
];

export default function PrayerTimesScreen() {
  const [{ city, prayerTimes }, setData] = useState({});
  const { city: cityName, prayerTimes: times } = useLocationAndPrayer(setData);
  const activePrayer = 'Asr';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.location}>{cityName} 📍</Text>
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
