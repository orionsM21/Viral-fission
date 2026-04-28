import React, {memo} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

const SearchBarComponent = ({colors, value, onChangeText, onClear}) => {
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.input, borderColor: colors.border},
      ]}>
      <TextInput
        placeholder="Search posts or authors"
        placeholderTextColor={colors.subtext}
        style={[styles.input, {color: colors.text}]}
        value={value}
        onChangeText={onChangeText}
      />
      {value ? (
        <TouchableOpacity hitSlop={10} onPress={onClear}>
          <Text style={[styles.clearText, {color: colors.accent}]}>Clear</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const SearchBar = memo(SearchBarComponent);

const styles = StyleSheet.create({
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
});
