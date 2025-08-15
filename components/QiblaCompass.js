// components/QiblaCompass.js
import { Magnetometer } from 'expo-sensors';
import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Image, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

// Hook to manage compass
const useQiblaCompass = (latitude, longitude) => {
  const [subscription, setSubscription] = useState(null);
  const [magnetometer, setMagnetometer] = useState(0);
  const [qiblad, setQiblad] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initCompass = useCallback(() => {
    Magnetometer.isAvailableAsync()
      .then((isAvailable) => {
        if (!isAvailable) {
          setError('Compass is not available on this device');
          setIsLoading(false);
          return;
        }

        if (latitude && longitude) {
          calculate(latitude, longitude);
        } else {
          setError('Location not available');
        }
        setIsLoading(false);
        subscribe();
      })
      .catch((err) => {
        setError(err.message || 'Compass error');
        setIsLoading(false);
      });
  }, [latitude, longitude]);

  useEffect(() => {
    initCompass();
    return () => unsubscribe();
  }, [initCompass]);

  const subscribe = () => {
    Magnetometer.setUpdateInterval(100);
    setSubscription(
      Magnetometer.addListener((data) => {
        setMagnetometer(angle(data));
      })
    );
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const angle = (magnetometer) => {
    let angle = 0;
    if (magnetometer) {
      const { x, y } = magnetometer;
      if (Math.atan2(y, x) >= 0) {
        angle = Math.atan2(y, x) * (180 / Math.PI);
      } else {
        angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
      }
    }
    return Math.round(angle);
  };

  const degree = (magnetometer) =>
    magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;

  const calculate = (lat, lon) => {
    const PI = Math.PI;
    const latk = (21.4225 * PI) / 180.0;
    const longk = (39.8264 * PI) / 180.0;
    const phi = (lat * PI) / 180.0;
    const lambda = (lon * PI) / 180.0;
    const qibla =
      (180.0 / PI) *
      Math.atan2(
        Math.sin(longk - lambda),
        Math.cos(phi) * Math.tan(latk) -
          Math.sin(phi) * Math.cos(longk - lambda)
      );
    setQiblad(qibla);
  };

  const compassDegree = degree(magnetometer);
  const compassRotate = 360 - degree(magnetometer);
  const kabaRotate = 360 - degree(magnetometer) + qiblad;

  return {
    qiblad,
    compassDegree,
    compassRotate,
    kabaRotate,
    error,
    isLoading,
    reinitCompass: initCompass,
  };
};

// Component
const QiblaCompass = forwardRef(
  ({ latitude, longitude, backgroundColor = 'transparent', color = '#6B4930' }, ref) => {
    const {
      qiblad,
      compassDegree,
      compassRotate,
      kabaRotate,
      error,
      isLoading,
      reinitCompass,
    } = useQiblaCompass(latitude, longitude);

    useImperativeHandle(ref, () => ({
      reinitCompass,
    }));

    if (isLoading) {
      return (
        <View style={[styles.container, { backgroundColor }]}>
          <ActivityIndicator size={50} color={color} />
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor }]}>
        {error && (
          <Text style={[styles.errorText]}>
            Error: {error}
          </Text>
        )}
        <Text style={[styles.degreeText, { color }]}>
          {compassDegree}° | Qibla: {qiblad.toFixed(2)}°
        </Text>

        <View style={{ width: '100%', height: moderateScale(300, 0.25), position: 'relative' }}>
          <Image
            source={require('../assets/compass.jpg')}
            style={[
              styles.image,
              { transform: [{ rotate: `${compassRotate}deg` }] },
            ]}
          />
          <View
            style={{
              width: moderateScale(300, 0.25),
              height: moderateScale(300, 0.25),
              position: 'absolute',
              alignSelf: 'center',
              transform: [{ rotate: `${kabaRotate}deg` }],
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Image
              source={require('../assets/kaaba.png')}
              style={{ resizeMode: 'center', height: 100, width: 40 }}
            />
          </View>
        </View>
      </View>
    );
  }
);

QiblaCompass.propTypes = {
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  image: {
    resizeMode: 'contain',
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    width: moderateScale(300, 0.25),
    height: moderateScale(300, 0.25),
  },
  degreeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  errorText: {
    color: '#f00',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});

export default QiblaCompass;
