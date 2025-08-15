// screens/PrayerTimesScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useLocationAndPrayer } from '../hooks/useLocationAndPrayer';
import PrayerCard from '../components/PrayerCard';
import moment from 'moment';
import QiblaCompass from '../components/QiblaCompass';

export default function PrayerTimesScreen() {
  const route = useRoute();
  const params = route.params || {};
  const [localCity, setLocalCity] = useState(params.city || '');
  const [times, setTimes] = useState(params.prayerTimes || null);
  const [watchId, setWatchId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const { 
    city, 
    prayerTimes, 
    loading, 
    error, 
    getLocation,
    watchLocation,
    clearLocationWatch,
    stopLocationObserving
  } = useLocationAndPrayer();

  // Fetch location data if not provided via navigation
  const fetchLocationData = useCallback(async () => {
    if (times && localCity) return; // Skip if data already available

    try {
      setRetryCount(prev => prev + 1);
      const result = await getLocation();
      setLocalCity(result.city);
      setTimes(result.prayerTimes);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.warn('PrayerTimesScreen getLocation error:', err);
      
      // Show user-friendly error message
      if (retryCount < 3) {
        // Auto-retry up to 3 times
        setTimeout(fetchLocationData, 2000 * retryCount);
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your location. Please check your location settings and try again.',
          [
            { text: 'Retry', onPress: () => {
              setRetryCount(0);
              fetchLocationData();
            }},
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    }
  }, [times, localCity, getLocation, retryCount]);

  // Handle manual location refresh
  const handleRefresh = useCallback(async () => {
    try {
      const result = await getLocation();
      setLocalCity(result.city);
      setTimes(result.prayerTimes);
      Alert.alert('Success', 'Location and prayer times updated!');
    } catch (err) {
      Alert.alert(
        'Error', 
        'Failed to refresh location. Please check your location settings.',
        [{ text: 'OK' }]
      );
    }
  }, [getLocation]);

  // Enable location watching (optional feature)
  const enableLocationTracking = useCallback(async () => {
    try {
      const result = await watchLocation();
      setWatchId(result.watchId);
      setLocalCity(result.city);
      setTimes(result.prayerTimes);
    } catch (err) {
      console.warn('Failed to enable location tracking:', err);
    }
  }, [watchLocation]);

  // Initial data fetch
  useEffect(() => {
    let mounted = true;
    
    if (!times || !localCity) {
      fetchLocationData();
    }

    return () => { 
      mounted = false; 
    };
  }, [fetchLocationData]);

  // Cleanup location watching when screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (watchId) {
          clearLocationWatch(watchId);
          setWatchId(null);
        }
        stopLocationObserving();
      };
    }, [watchId, clearLocationWatch, stopLocationObserving])
  );

  // Update local state when hook state changes
  useEffect(() => {
    if (city && !localCity) {
      setLocalCity(city);
    }
    if (prayerTimes && !times) {
      setTimes(prayerTimes);
    }
  }, [city, prayerTimes, localCity, times]);

  // Render loading state
  if (loading && !times) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4930" />
          <Text style={styles.loadingText}>Getting your location...</Text>
          <Text style={styles.subText}>This may take a few seconds</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !times) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>📍 Location Error</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchLocationData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getCurrentPrayer = () => {
  if (!times) return null;
  
  const now = moment();
  let currentPrayer = null;
  let lastTime = moment().startOf('day');

  for (const [name, t] of Object.entries(times)) {
    const prayerMoment = moment(t, 'HH:mm');
    if (now.isSameOrAfter(prayerMoment)) {
      currentPrayer = name;
      lastTime = prayerMoment;
    }
  }
  return currentPrayer;
};

const currentPrayer = getCurrentPrayer();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Text style={styles.location}>
            {localCity || city || 'Detecting location...'} 📍
          </Text>
          {loading && <ActivityIndicator size="small" color="#6B4930" style={styles.loadingIndicator} />}
        </View>
        <Text style={styles.date}>{new Date().toDateString()}</Text>
        
        {/* Refresh button */}
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>
            {loading ? 'Updating...' : 'Refresh Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {times ? (
      <View style={styles.list}>
        {Object.entries(times).map(([name, time]) => (
          <PrayerCard
            key={name}
            name={name.charAt(0).toUpperCase() + name.slice(1)}
            time={time}
            active={name === currentPrayer}
          />
        ))}
      </View>
    ) : (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No prayer times available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLocationData}>
          <Text style={styles.retryButtonText}>Get Prayer Times</Text>
        </TouchableOpacity>
      </View>
    )}

      {/* Optional: Enable live tracking button */}
      {!watchId && times && (
        <TouchableOpacity 
          style={styles.trackingButton} 
          onPress={enableLocationTracking}
        >
          <Text style={styles.trackingButtonText}>Enable Live Updates</Text>
        </TouchableOpacity>
      )}

      {watchId && (
        <View style={styles.trackingIndicator}>
          <Text style={styles.trackingText}>🔄 Live location updates enabled</Text>
        </View>
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  location: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  loadingIndicator: {
    marginLeft: 10,
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#6B4930',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    marginTop: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B4930',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#6B4930',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  trackingButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  trackingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  trackingIndicator: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  trackingText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
});
