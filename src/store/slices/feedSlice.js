import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import {fetchFeedData, pingServer, postComment} from '../../services/api';
import {loadFeedCache} from '../../utils/storage';

const INITIAL_BATCH_SIZE = 6;

const initialState = {
  posts: [],
  usersById: {},
  commentsByPostId: {},
  visibleCount: INITIAL_BATCH_SIZE,
  searchQuery: '',
  isHydrated: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  isOffline: false,
  lastUpdated: null,
};

const groupComments = comments => {
  return comments.reduce((accumulator, comment) => {
    const key = String(comment.postId);

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(comment);
    return accumulator;
  }, {});
};

const extractLocalComments = state => {
  return Object.values(state.commentsByPostId)
    .flat()
    .filter(comment => comment.isLocal);
};

const mergeLocalComments = (remoteCommentsByPostId, localComments) => {
  const merged = {...remoteCommentsByPostId};

  localComments.forEach(comment => {
    const key = String(comment.postId);
    const bucket = merged[key] ? [...merged[key]] : [];
    const alreadyPresent = bucket.some(existing => existing.id === comment.id);

    if (!alreadyPresent) {
      bucket.unshift(comment);
      merged[key] = bucket;
    }
  });

  return merged;
};

export const hydrateFeedCache = createAsyncThunk(
  'feed/hydrateCache',
  async () => loadFeedCache(),
);

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (isRefresh, {getState, rejectWithValue}) => {
    try {
      const data = await fetchFeedData();
      const state = getState();
      const localComments = extractLocalComments(state.feed);

      return {
        posts: data.posts,
        usersById: data.users.reduce((accumulator, user) => {
          accumulator[user.id] = user;
          return accumulator;
        }, {}),
        commentsByPostId: mergeLocalComments(
          groupComments(data.comments),
          localComments,
        ),
        isRefresh: Boolean(isRefresh),
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch feed data');
    }
  },
);

export const checkConnectivity = createAsyncThunk(
  'feed/checkConnectivity',
  async (_, {rejectWithValue}) => {
    try {
      await pingServer();
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Network check failed');
    }
  },
);

export const syncPendingComments = createAsyncThunk(
  'feed/syncPendingComments',
  async (_, {getState, rejectWithValue}) => {
    const state = getState().feed;

    if (state.isOffline) {
      return [];
    }

    const pendingComments = extractLocalComments(state).filter(
      comment => comment.syncStatus === 'pending',
    );

    try {
      const syncedIds = [];

      for (const comment of pendingComments) {
        await postComment({
          id: comment.id,
          postId: comment.postId,
          name: comment.name,
          email: comment.email,
          body: comment.body,
          isLocal: true,
        });
        syncedIds.push(comment.id);
      }

      return syncedIds;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to sync comments');
    }
  },
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    loadNextPage: state => {
      state.visibleCount = Math.min(
        state.visibleCount + INITIAL_BATCH_SIZE,
        state.posts.length,
      );
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.visibleCount = INITIAL_BATCH_SIZE;
    },
    dismissError: state => {
      state.error = null;
    },
    setOfflineStatus: (state, action) => {
      state.isOffline = action.payload;
    },
    addOfflineComment: {
      reducer: (state, action) => {
        const {postId, comment} = action.payload;
        const key = String(postId);
        const bucket = state.commentsByPostId[key]
          ? [...state.commentsByPostId[key]]
          : [];

        bucket.unshift(comment);
        state.commentsByPostId[key] = bucket;
      },
      prepare: payload => {
        const now = Date.now();

        return {
          payload: {
            postId: payload.postId,
            comment: {
              id: `local-${payload.postId}-${now}`,
              postId: payload.postId,
              name: 'You',
              email: 'offline@local.dev',
              body: payload.body.trim(),
              isLocal: true,
              syncStatus: 'pending',
            },
          },
        };
      },
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateFeedCache.fulfilled, (state, action) => {
        state.isHydrated = true;

        if (!action.payload) {
          return;
        }

        state.posts = action.payload.posts;
        state.usersById = action.payload.usersById;
        state.commentsByPostId = action.payload.commentsByPostId;
        state.visibleCount = Math.max(
          INITIAL_BATCH_SIZE,
          action.payload.visibleCount || INITIAL_BATCH_SIZE,
        );
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(hydrateFeedCache.rejected, state => {
        state.isHydrated = true;
      })
      .addCase(fetchFeed.pending, (state, action) => {
        state.error = null;

        if (action.meta.arg) {
          state.isRefreshing = true;
        } else {
          state.isLoading = true;
        }
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.posts = action.payload.posts;
        state.usersById = action.payload.usersById;
        state.commentsByPostId = action.payload.commentsByPostId;
        state.visibleCount = Math.max(
          INITIAL_BATCH_SIZE,
          Math.min(state.visibleCount, action.payload.posts.length),
        );
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = null;
        state.isOffline = false;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.isOffline = true;
        state.error =
          action.payload ||
          'Unable to load the feed. Pull to retry when you are back online.';
      })
      .addCase(checkConnectivity.fulfilled, state => {
        state.isOffline = false;
      })
      .addCase(checkConnectivity.rejected, state => {
        state.isOffline = true;
      })
      .addCase(syncPendingComments.fulfilled, (state, action) => {
        if (!action.payload.length) {
          return;
        }

        Object.keys(state.commentsByPostId).forEach(key => {
          state.commentsByPostId[key] = state.commentsByPostId[key].map(
            comment =>
              action.payload.includes(comment.id)
                ? {...comment, syncStatus: 'synced'}
                : comment,
          );
        });

        state.error = null;
      })
      .addCase(syncPendingComments.rejected, (state, action) => {
        state.error =
          action.payload ||
          'We kept your offline comments locally and will retry syncing later.';
      });
  },
});

export const {
  addOfflineComment,
  dismissError,
  loadNextPage,
  setOfflineStatus,
  setSearchQuery,
} = feedSlice.actions;

export {INITIAL_BATCH_SIZE};
export default feedSlice.reducer;
