import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';

const LoadingSkeletonComponent = ({colors}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      <View
        style={[styles.line, styles.title, {backgroundColor: colors.input}]}
      />
      <View style={[styles.line, {backgroundColor: colors.input}]} />
      <View
        style={[styles.line, styles.shortLine, {backgroundColor: colors.input}]}
      />
      <View style={[styles.comment, {backgroundColor: colors.input}]} />
      <View style={[styles.comment, {backgroundColor: colors.input}]} />
    </View>
  );
};

export const LoadingSkeleton = memo(LoadingSkeletonComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 18,
  },
  comment: {
    borderRadius: 8,
    height: 44,
    marginTop: 12,
  },
  line: {
    borderRadius: 8,
    height: 14,
    marginBottom: 10,
  },
  shortLine: {
    width: '62%',
  },
  title: {
    height: 18,
    width: '72%',
  },
});
