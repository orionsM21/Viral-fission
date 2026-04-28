import {configureStore} from '@reduxjs/toolkit';

import {saveFeedCache} from '../utils/storage';
import feedReducer from './slices/feedSlice';

export const store = configureStore({
  reducer: {
    feed: feedReducer,
  },
});

let lastPersistedSnapshot = '';

store.subscribe(() => {
  const state = store.getState().feed;
  const cache = {
    posts: state.posts,
    usersById: state.usersById,
    commentsByPostId: state.commentsByPostId,
    visibleCount: state.visibleCount,
    lastUpdated: state.lastUpdated,
  };
  const serialized = JSON.stringify(cache);

  if (serialized !== lastPersistedSnapshot) {
    lastPersistedSnapshot = serialized;
    saveFeedCache(cache).catch(() => null);
  }
});
