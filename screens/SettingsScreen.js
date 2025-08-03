import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';


const { width } = Dimensions.get('window');

const SettingItem = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <View>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
    <Text style={styles.arrow}>{'>'}</Text>
  </TouchableOpacity>
);

const SettingsScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Section: Prayer Calculation */}
      <Text style={styles.sectionTitle}>PRAYER CALCULATION</Text>
      <SettingItem
        icon={require('../assets/calculation.png')}
        title="Calculation Method"
        subtitle="Muslim World League"
        onPress={() => {}}
      />

      {/* Section: Preferences */}
      <Text style={styles.sectionTitle}>PREFERENCES</Text>
      <SettingItem
        icon={require('../assets/language.jpg')}
        title="Language"
        subtitle="English"
        onPress={() => {}}
      />
      <SettingItem
        icon={require('../assets/theme.png')}
        title="Theme"
        subtitle="Light Mode"
        onPress={() => {}}
      />

      {/* Section: About */}
      <Text style={styles.sectionTitle}>ABOUT</Text>
      <SettingItem
        icon={require('../assets/info.png')}
        title="App Version"
        subtitle="1.0.0"
        onPress={() => {}}
      />
      <SettingItem
        icon={require('../assets/info.png')}
        title="Privacy Policy"
        onPress={() => {}}
      />
      <SettingItem
        icon={require('../assets/info.png')}
        title="Contact Us"
        onPress={() => {}}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  backArrow: {
    fontSize: 22,
    marginRight: 16,
    color: '#444',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 20,
    marginBottom: 6,
    paddingHorizontal: 20,
    fontWeight: '600',
  },
  item: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: width * 0.07,
    height: width * 0.07,
    marginRight: 16,
    // tintColor: '#2E7D32',
  },
  itemTitle: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
  },
});

export default SettingsScreen;
