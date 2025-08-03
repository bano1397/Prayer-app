import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeTasks = async (tasks) => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem('TASKS', jsonValue);
  } catch (e) {
    console.error('Saving tasks failed', e);
  }
};

export const loadTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('TASKS');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Loading tasks failed', e);
    return [];
  }
};
