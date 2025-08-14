// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ProgressBarAndroid, Platform, ProgressViewIOS } from 'react-native';
import PrayerCard from '../components/PrayerCard';
import moment from 'moment';

export default function HomeScreen({ route }) {
  const { city, prayerTimes } = route.params || {};
  const [nextPrayer, setNextPrayer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [progress, setProgress] = useState(0);

  // Determine active prayer & countdown
  useEffect(() => {
    if (!prayerTimes) return;

    const updateCountdown = () => {
      const now = moment();
      const prayersArray = Object.entries(prayerTimes).map(([name, time]) => ({
        name,
        time: moment(time, 'HH:mm'),
      }));

      // Find next prayer
      const upcoming = prayersArray.find(p => p.time.isAfter(now)) || prayersArray[0];
      setNextPrayer(upcoming.name);

      // Time remaining
      const diff = moment.duration(upcoming.time.diff(now));
      setTimeRemaining(`${diff.hours()}h ${diff.minutes()}m ${diff.seconds()}s`);

      // Progress calculation
      const previous = prayersArray.findLast(p => p.time.isBefore(now)) || prayersArray[prayersArray.length - 1];
      const totalDuration = moment.duration(upcoming.time.diff(previous.time)).asSeconds();
      const passed = moment.duration(now.diff(previous.time)).asSeconds();
      setProgress(passed / totalDuration);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [prayerTimes]);

  if (!prayerTimes) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Location & Date */}
      <Text style={styles.city}>{city}</Text>
      <Text style={styles.date}>{moment().format('D MMMM YYYY')}</Text>

      {/* Next Prayer Countdown */}
      <Text style={styles.nextPrayer}>
        Next Prayer in: {timeRemaining}
      </Text>

      {Platform.OS === 'android' ? (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={progress}
          color="#2E7D32"
        />
      ) : (
        <ProgressViewIOS progress={progress} progressTintColor="#2E7D32" />
      )}

      {/* Prayer List */}
      <View style={{ marginTop: 20 }}>
        {Object.entries(prayerTimes).map(([name, time]) => (
          <PrayerCard
            key={name}
            name={name.charAt(0).toUpperCase() + name.slice(1)}
            time={time}
            active={name === nextPrayer}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  city: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    textAlign: 'center',
    color: '#777',
    marginBottom: 16,
  },
  nextPrayer: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
    marginBottom: 8,
  },
});
