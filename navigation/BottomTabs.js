import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Image, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';

// Screens
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import DummyScreen from '../screens/DummyScreen';
import SettingsTabRedirect from '../screens/SettingsTabRedirect';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ focused, label, icon, iconActive }) => {
    return (
        <View style={styles.iconContainer}>
            <Image
                source={focused ? iconActive : icon}
                style={styles.icon}
                resizeMode="contain"
            />
            <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
        </View>
    );
};

export default function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
            }}
        >
            <Tab.Screen
                name="PrayerTimes"
                component={PrayerTimesScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            label="Prayer Times"
                            icon={require('../assets/home.png')}
                            iconActive={require('../assets/home.png')}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Qibla"
                component={DummyScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            label="Qibla"
                            icon={require('../assets/compass.jpg')}
                            iconActive={require('../assets/compass.jpg')}
                        />
                    ),
                }}
            />
            <Tab.Screen
  name="SettingsTab"
  component={SettingsTabRedirect}

                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            label="Settings"
                            icon={require('../assets/settings.jpg')}
                            iconActive={require('../assets/settings.jpg')}
                        />
                    ),
                }}
            />

        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: Platform.OS === 'ios' ? 90 : 70,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 8,
        borderTopColor: '#eee',
        borderTopWidth: 1,
        backgroundColor: '#fff',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 3,
    },
    icon: {
        width: 24,
        height: 24,
        marginBottom: 2,
    },
    label: {
        fontSize: 12,
        color: '#999',
    },
    labelActive: {
        color: '#6B4930',
        fontWeight: '600',
    },
});
