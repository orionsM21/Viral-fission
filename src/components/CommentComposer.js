import React, {memo, useCallback, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const CommentComposerComponent = ({colors, onSubmit}) => {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    onSubmit(trimmedValue);
    setValue('');
  }, [onSubmit, value]);

  return (
    <View style={styles.container}>
      <TextInput
        multiline
        placeholder="Add a comment"
        placeholderTextColor={colors.subtext}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={setValue}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.button, {backgroundColor: colors.accent}]}>
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

export const CommentComposer = memo(CommentComposerComponent);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: 8,
    marginTop: 8,
    minWidth: 78,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  container: {
    marginTop: 12,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
    minHeight: 64,
    padding: 10,
    textAlignVertical: 'top',
  },
});
