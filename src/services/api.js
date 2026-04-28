const BASE_URL = 'https://jsonplaceholder.typicode.com';

const fetchJson = async (path, options) => {
  const response = await fetch(`${BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchFeedData = async () => {
  const [posts, users, comments] = await Promise.all([
    fetchJson('/posts'),
    fetchJson('/users'),
    fetchJson('/comments'),
  ]);

  return {
    posts,
    users,
    comments: comments.map(comment => ({
      ...comment,
      id: String(comment.id),
      syncStatus: 'synced',
    })),
  };
};

export const postComment = async comment => {
  return fetchJson('/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comment),
  });
};

export const pingServer = async () => {
  const response = await fetch(`${BASE_URL}/posts?_limit=1`);

  if (!response.ok) {
    throw new Error('Unable to reach server');
  }

  return true;
};
