import React from 'react';
import { View, Text } from 'react-native';

export default function DummyScreen({ route }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{route.name} screen coming soon</Text>
    </View>
  );
}
