import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PrayerCard({ name, time, active }) {
  return (
    <View style={[styles.card, active && styles.activeCard]}>
      <View>
        <Text style={[styles.name, active && styles.activeText]}>{name}</Text>
        <Text style={[styles.time, active && styles.activeText]}>{time}</Text>
      </View>
      <Text style={[styles.emoji, active && styles.activeText]}>🌙</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeCard: {
    backgroundColor: '#834519ff',
  },
  name: {
    fontSize: 14,
    color: '#444',
  },
  time: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  activeText: {
    color: '#fff',
  },
  emoji: {
    fontSize: 18,
  },
});
