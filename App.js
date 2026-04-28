import React, {useCallback} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';

import {EmptyState} from './src/components/EmptyState';
import {LoadingSkeleton} from './src/components/LoadingSkeleton';
import {PostCard} from './src/components/PostCard';
import {SearchBar} from './src/components/SearchBar';

import {useFeedBootstrap} from './src/hooks/useFeedBootstrap';
import {store} from './src/store';
import {
  addOfflineComment,
  dismissError,
  fetchFeed,
  loadNextPage,
  setSearchQuery,
  syncPendingComments,
} from './src/store/slices/feedSlice';
import {darkTheme, lightTheme} from './src/theme/theme';

const FeedScreen = () => {
  useFeedBootstrap();

  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkTheme : lightTheme;

  const {
    commentsByPostId,
    error,
    isLoading,
    isOffline,
    isRefreshing,
    lastUpdated,
    posts,
    searchQuery,
    usersById,
    visibleCount,
  } = useSelector(state => state.feed);

  const query = searchQuery.trim().toLowerCase();

  const filteredPosts = query
    ? posts.filter(post => {
        const user = usersById[post.userId];
        const text = `${post.title} ${post.body} ${user?.name || ''} ${
          user?.email || ''
        }`.toLowerCase();

        return text.includes(query);
      })
    : posts;

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  const pendingCommentCount = Object.values(commentsByPostId)
    .flat()
    .filter(
      comment => comment.isLocal && comment.syncStatus === 'pending',
    ).length;

  const handleRefresh = useCallback(() => {
    dispatch(fetchFeed(true));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (visibleCount < filteredPosts.length) {
      dispatch(loadNextPage());
    }
  }, [dispatch, filteredPosts.length, visibleCount]);

  const handleAddComment = useCallback(
    (postId, body) => {
      dispatch(addOfflineComment({postId, body}));

      if (!isOffline) {
        dispatch(syncPendingComments());
      }
    },
    [dispatch, isOffline],
  );

  const handleRetry = useCallback(() => {
    dispatch(dismissError());
    dispatch(fetchFeed(false));
  }, [dispatch]);

  const renderItem = useCallback(
    ({item}) => (
      <PostCard
        colors={colors}
        comments={commentsByPostId[String(item.id)] || []}
        onAddComment={handleAddComment}
        post={item}
        user={usersById[item.userId]}
      />
    ),
    [colors, commentsByPostId, handleAddComment, usersById],
  );

  const keyExtractor = useCallback(item => String(item.id), []);

  const renderFooter = () => {
    if (!visiblePosts.length) {
      return null;
    }

    if (visibleCount < filteredPosts.length) {
      return (
        <TouchableOpacity
          onPress={handleLoadMore}
          style={[styles.loadMoreButton, {backgroundColor: colors.accent}]}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      );
    }

    return <View style={styles.footerSpacer} />;
  };

  const renderHeader = () => (
    <View>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, {color: colors.text}]}>Post Feed</Text>
          <Text style={[styles.subheading, {color: colors.subtext}]}>
            {isOffline ? 'Offline mode' : 'Live from JSONPlaceholder'}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isOffline ? colors.accentSoft : colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.statusText, {color: colors.text}]}>
            {isOffline ? 'Offline' : 'Online'}
          </Text>
        </View>
      </View>

      <SearchBar
        colors={colors}
        onChangeText={text => dispatch(setSearchQuery(text))}
        onClear={() => dispatch(setSearchQuery(''))}
        value={searchQuery}
      />

      <View style={styles.metaRow}>
        <Text style={[styles.metaText, {color: colors.subtext}]}>
          Showing {visiblePosts.length} of {filteredPosts.length} posts
        </Text>
        <Text style={[styles.metaText, {color: colors.subtext}]}>
          Pending comments: {pendingCommentCount}
        </Text>
      </View>

      {lastUpdated ? (
        <Text
          style={[styles.metaText, styles.metaBottom, {color: colors.subtext}]}>
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </Text>
      ) : null}

      {error ? (
        <TouchableOpacity
          onPress={handleRetry}
          style={[
            styles.errorBanner,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <Text style={[styles.errorTitle, {color: colors.text}]}>
            Network error
          </Text>
          <Text style={[styles.errorMessage, {color: colors.subtext}]}>
            {error}
          </Text>
          <Text style={[styles.retryText, {color: colors.accent}]}>
            Tap to retry
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (isLoading && !posts.length) {
    return (
      <SafeAreaView
        style={[styles.screen, {backgroundColor: colors.background}]}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <View style={styles.container}>
          <Text style={[styles.heading, {color: colors.text}]}>Post Feed</Text>
          <LoadingSkeleton colors={colors} />
          <LoadingSkeleton colors={colors} />
          <LoadingSkeleton colors={colors} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.headerContainer}>{renderHeader()}</View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={visiblePosts}
        initialNumToRender={4}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <EmptyState
            actionLabel={posts.length ? undefined : 'Retry'}
            colors={colors}
            onAction={posts.length ? undefined : handleRetry}
            subtitle={
              posts.length
                ? 'Try a different search term or clear the filter.'
                : 'No cached posts are available yet. Retry when the network is back.'
            }
            title={posts.length ? 'No matches found' : 'Nothing to show yet'}
          />
        }
        ListFooterComponent={renderFooter}
        maxToRenderPerBatch={4}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        removeClippedSubviews
        renderItem={renderItem}
        windowSize={7}
      />
      {isLoading && posts.length ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <FeedScreen />
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  errorBanner: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  errorMessage: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerSpacer: {
    height: 12,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  loadMoreButton: {
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 13,
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingOverlay: {
    paddingBottom: 14,
  },
  metaBottom: {
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  metaText: {
    fontSize: 11,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  screen: {
    flex: 1,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 13,
    marginTop: 4,
  },
});
