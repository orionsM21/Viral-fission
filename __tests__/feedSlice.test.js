jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import reducer, {
  addOfflineComment,
  loadNextPage,
  setSearchQuery,
} from '../src/store/slices/feedSlice';

describe('feedSlice', () => {
  it('adds an offline comment as pending sync', () => {
    const state = reducer(
      undefined,
      addOfflineComment({postId: 4, body: 'Saved while offline'}),
    );

    const comments = state.commentsByPostId['4'];

    expect(comments).toHaveLength(1);
    expect(comments[0].body).toBe('Saved while offline');
    expect(comments[0].syncStatus).toBe('pending');
    expect(comments[0].isLocal).toBe(true);
  });

  it('resets visible count when a new search query is applied', () => {
    const initialState = {
      ...reducer(undefined, {type: 'init'}),
      visibleCount: 18,
    };

    const state = reducer(initialState, setSearchQuery('qui'));

    expect(state.searchQuery).toBe('qui');
    expect(state.visibleCount).toBe(6);
  });

  it('loads the next page in six-item batches', () => {
    const initialState = {
      ...reducer(undefined, {type: 'init'}),
      posts: Array.from({length: 25}, (_, index) => ({
        id: index + 1,
        userId: 1,
        title: `Post ${index + 1}`,
        body: 'Body',
      })),
    };

    const state = reducer(initialState, loadNextPage());

    expect(state.visibleCount).toBe(12);
  });
});
