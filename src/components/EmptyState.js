import React, {memo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const EmptyStateComponent = ({
  colors,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
      <Text style={[styles.subtitle, {color: colors.subtext}]}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.button, {backgroundColor: colors.accent}]}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const EmptyState = memo(EmptyStateComponent);

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    borderRadius: 8,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 28,
    padding: 24,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});
