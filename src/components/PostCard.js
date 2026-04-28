import React, {memo, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {CommentComposer} from './CommentComposer';

const PostCardComponent = ({colors, comments, post, user, onAddComment}) => {
  const [showAllComments, setShowAllComments] = useState(false);

  const visibleComments = useMemo(() => {
    if (showAllComments) {
      return comments;
    }

    return comments.slice(0, 2);
  }, [comments, showAllComments]);

  return (
    <View
      style={[
        styles.card,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <Text style={[styles.title, {color: colors.text}]}>{post.title}</Text>
      <Text style={[styles.body, {color: colors.subtext}]}>{post.body}</Text>

      <View
        style={[
          styles.userBox,
          {backgroundColor: colors.accentSoft, borderColor: colors.border},
        ]}>
        <Text style={[styles.userName, {color: colors.text}]}>
          {user?.name || 'Unknown author'}
        </Text>
        <Text style={[styles.userEmail, {color: colors.subtext}]}>
          {user?.email || 'No email available'}
        </Text>
      </View>

      <View style={styles.commentsHeader}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Comments
        </Text>
        {comments.length > 2 ? (
          <TouchableOpacity
            onPress={() => setShowAllComments(!showAllComments)}>
            <Text style={[styles.toggleText, {color: colors.accent}]}>
              {showAllComments ? 'Show less' : `Show all (${comments.length})`}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {comments.length ? (
        visibleComments.map(comment => (
          <View
            key={comment.id}
            style={[styles.commentCard, {borderColor: colors.border}]}>
            <View style={styles.commentHeader}>
              <Text style={[styles.commentName, {color: colors.text}]}>
                {comment.name}
              </Text>
              {comment.isLocal ? (
                <Text
                  style={[
                    styles.commentStatus,
                    {
                      color:
                        comment.syncStatus === 'pending'
                          ? colors.subtext
                          : colors.success,
                    },
                  ]}>
                  {comment.syncStatus === 'pending' ? 'Pending sync' : 'Synced'}
                </Text>
              ) : null}
            </View>
            <Text style={[styles.commentEmail, {color: colors.subtext}]}>
              {comment.email}
            </Text>
            <Text style={[styles.commentBody, {color: colors.text}]}>
              {comment.body}
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.emptyComments, {color: colors.subtext}]}>
          No comments yet.
        </Text>
      )}

      <CommentComposer
        colors={colors}
        onSubmit={body => onAddComment(post.id, body)}
      />
    </View>
  );
};

export const PostCard = memo(PostCardComponent);

const styles = StyleSheet.create({
  body: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 8,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  commentBody: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  commentCard: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    padding: 10,
  },
  commentEmail: {
    fontSize: 11,
    marginTop: 2,
  },
  commentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  commentStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  commentsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  emptyComments: {
    fontSize: 13,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userBox: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 10,
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
});
