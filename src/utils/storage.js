import AsyncStorage from '@react-native-async-storage/async-storage';

const FEED_CACHE_KEY = '@viral_fission/feed-cache';

export const loadFeedCache = async () => {
  const rawValue = await AsyncStorage.getItem(FEED_CACHE_KEY);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue);
};

export const saveFeedCache = async cache => {
  await AsyncStorage.setItem(FEED_CACHE_KEY, JSON.stringify(cache));
};
