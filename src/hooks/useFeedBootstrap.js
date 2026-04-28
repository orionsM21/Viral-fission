import {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {
  checkConnectivity,
  fetchFeed,
  hydrateFeedCache,
  syncPendingComments,
} from '../store/slices/feedSlice';

export const useFeedBootstrap = () => {
  const dispatch = useDispatch();
  const {isHydrated, isOffline, commentsByPostId} = useSelector(
    state => state.feed,
  );

  useEffect(() => {
    dispatch(hydrateFeedCache());
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    dispatch(fetchFeed(false));
  }, [dispatch, isHydrated]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(checkConnectivity());
    }, 15000);

    dispatch(checkConnectivity());

    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    if (isOffline) {
      return;
    }

    const hasPendingComments = Object.values(commentsByPostId)
      .flat()
      .some(comment => comment.isLocal && comment.syncStatus === 'pending');

    if (hasPendingComments) {
      dispatch(syncPendingComments());
    }
  }, [commentsByPostId, dispatch, isOffline]);
};
